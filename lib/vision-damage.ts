import fs from 'fs';
import path from 'path';
import {
  downloadSupabaseStorageObject,
  hasSupabaseStorageConfig,
} from '@/lib/supabase-storage';
import { getS3Url } from '@/lib/s3';
import { assertTenantScopedStorageKey } from '@/lib/file-access';
import { prepareImageForVisionAnalysis } from '@/lib/prepareVisionImage';
import { isRavinDamageEnabled } from '@/lib/damage-detection/ravin';
import type { VisionDamageFinding, VisionDamageResult } from '@/types/vision-damage';

export { assertTenantScopedStorageKey };

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function isOpenAiDamageEnabled(): boolean {
  if (process.env.OPENAI_VISION_DAMAGE_ENABLED === 'false') return false;
  return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
}

/** @deprecated Use isDamageDetectionEnabled from @/lib/damage-detection */
export function isVisionDamageEnabled(): boolean {
  if (process.env.DAMAGE_DETECTION_ENABLED === 'false') return false;
  return isOpenAiDamageEnabled() || isRavinDamageEnabled();
}

function imageMimeFromBuffer(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return 'image/jpeg';
}

/** Load inspection image bytes from Supabase, S3 signed URL, or local uploads fallback. */
export async function loadInspectionImageBuffer(storageKey: string): Promise<Buffer | null> {
  const key = storageKey.replace(/^\/+/, '');

  if (key.startsWith('tenants/') && hasSupabaseStorageConfig()) {
    const buf = await downloadSupabaseStorageObject(key);
    if (buf?.length) return buf;
  }

  if (key.startsWith('tenants/')) {
    try {
      const signed = await getS3Url(key);
      if (signed.startsWith('http')) {
        const res = await fetch(signed);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          const buf = Buffer.from(ab);
          if (buf.length) return buf;
        }
      }
    } catch {
      /* fall through */
    }
  }

  const localPath = path.join(UPLOAD_DIR, key);
  if (fs.existsSync(localPath)) {
    const buf = fs.readFileSync(localPath);
    return buf.length ? buf : null;
  }

  return null;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function parseFindings(raw: unknown): VisionDamageFinding[] {
  if (!Array.isArray(raw)) return [];
  const out: VisionDamageFinding[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const label = typeof o.label === 'string' ? o.label.trim() : '';
    if (!label) continue;
    const sev = o.severity;
    const severity =
      sev === 'minor' || sev === 'moderate' || sev === 'major' ? sev : 'unknown';
    const conf = o.confidence;
    const confidence =
      conf === 'high' || conf === 'medium' || conf === 'low' ? conf : undefined;
    out.push({
      label: label.slice(0, 200),
      severity,
      x: clamp01(Number(o.x)),
      y: clamp01(Number(o.y)),
      confidence,
      repairEstimateAud:
        typeof o.repairEstimateAud === 'string'
          ? o.repairEstimateAud.trim().slice(0, 80)
          : typeof o.repairEstimate === 'string'
            ? o.repairEstimate.trim().slice(0, 80)
            : undefined,
      repairNotes:
        typeof o.repairNotes === 'string' ? o.repairNotes.trim().slice(0, 200) : undefined,
    });
  }
  return out.slice(0, 12);
}

function extractJsonObject(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parseVisionJson(content: string, model: string): VisionDamageResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJsonObject(content)) as Record<string, unknown>;
  } catch {
    return {
      summary: 'Could not parse vision response.',
      noDamageFound: true,
      findings: [],
      model,
      detectedAt: new Date().toISOString(),
    };
  }

  const findings = parseFindings(parsed.findings);
  const noDamageFound =
    parsed.noDamageFound === true || (findings.length === 0 && parsed.noDamageFound !== false);
  const summary =
    typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim().slice(0, 500)
      : noDamageFound
        ? 'No visible damage detected in this image.'
        : `${findings.length} potential issue(s) noted. Technician to confirm.`;

  return {
    summary,
    noDamageFound: noDamageFound && findings.length === 0,
    findings,
    model,
    detectedAt: new Date().toISOString(),
    repairEstimateSummary:
      typeof parsed.repairEstimateSummary === 'string'
        ? parsed.repairEstimateSummary.trim().slice(0, 500)
        : undefined,
    totalRepairEstimateAud:
      typeof parsed.totalRepairEstimateAud === 'string'
        ? parsed.totalRepairEstimateAud.trim().slice(0, 80)
        : typeof parsed.totalRepairEstimate === 'string'
          ? parsed.totalRepairEstimate.trim().slice(0, 80)
          : undefined,
  };
}

function isTyreWheelFocus(options: {
  context?: string;
  itemName?: string;
  panelHint?: string;
}): boolean {
  const combined = [options.panelHint, options.itemName, options.context]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /\b(tyre|tires|tyres|wheel|wheels|rim|rims|alloy|hub|curb)\b/.test(combined);
}

const TYRE_WHEEL_FOCUS = `This photo focuses on TYRES and/or ALLOY WHEELS. You MUST carefully inspect:
- Outer rim lip and wheel edge for curb rash, gouges, scrapes, chips, and missing lacquer (often bright silver/grey marks on a dark rim)
- Wheel spokes and face for scuffs and scratches
- Tyre sidewall for scuffs, abrasions, cuts, bulges, and marking damage
Report curb rash and rim-edge scuffs even when minor — they are common pre-delivery defects. If any rim or sidewall damage is visible, set noDamageFound false and add findings with accurate x,y on the damage.`;

function buildSystemPrompt(tyreWheelFocus: boolean): string {
  const base = `You are a senior automotive damage assessor for Australian pre-delivery inspections (PDI).
Inspect the photo as thoroughly as you would in ChatGPT: scan the entire frame systematically (edges, corners, reflections, dark paint, wheel lips, tyre sidewalls).
Identify ALL visible damage: scratches, scuffs, paint transfer, swirl marks, dents, chips, cracks, rust, misalignment, curb rash, gouges, tyre sidewall damage, and lacquer loss.
Report subtle defects — light scuffs on dark paint and minor curb rash on alloy rims are common PDI catches. Use confidence "low" when unsure rather than skipping.
Provide indicative repair guidance and AUD cost ranges using typical Australian body shop / SMART repair pricing (labour + materials). Ranges are estimates only.
Do not invent damage not visible in the image. If the photo is unusable, set noDamageFound true and explain in summary.`;

  const focus = tyreWheelFocus ? `\n\n${TYRE_WHEEL_FOCUS}` : '';

  return `${base}${focus}

Output ONLY valid JSON:
{
  "summary": "2-3 sentences: condition assessment for the technician",
  "noDamageFound": boolean,
  "repairEstimateSummary": "brief overall repair narrative (or null if none)",
  "totalRepairEstimateAud": "indicative total AUD range e.g. \\"$0\\" or \\"$150–$450\\" (or null if none)",
  "findings": [
    {
      "label": "short defect description",
      "severity": "minor" | "moderate" | "major",
      "x": 0.0-1.0,
      "y": 0.0-1.0,
      "confidence": "high" | "medium" | "low",
      "repairEstimateAud": "indicative AUD range for this defect e.g. \\"$80–$200\\"",
      "repairNotes": "likely repair method e.g. buff, touch-up, panel beat"
    }
  ]
}
x,y = normalized centre of each defect (0=left/top, 1=right/bottom). Max 12 findings. Australian English.`;
}

export async function detectVehicleDamageFromBuffer(
  imageBuffer: Buffer,
  options: {
    context?: string;
    itemName?: string;
    panelHint?: string;
  } = {}
): Promise<VisionDamageResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const tyreWheelFocus = isTyreWheelFocus(options);
  const model = process.env.OPENAI_VISION_DAMAGE_MODEL?.trim() || 'gpt-4o';
  const contextParts: string[] = [];
  if (options.panelHint) contextParts.push(`Vehicle area / panel: ${options.panelHint}`);
  if (options.itemName) contextParts.push(`Checklist item: ${options.itemName}`);
  if (options.context) contextParts.push(options.context);
  const contextLine =
    contextParts.length > 0
      ? `\nInspection context: ${contextParts.join('. ')}.`
      : '';

  const systemPrompt = buildSystemPrompt(tyreWheelFocus);
  const userText = tyreWheelFocus
    ? `Perform a detailed PDI assessment of this tyre/wheel photo. Look closely at the outer rim lip for curb rash, alloy scuffs, and tyre sidewall damage.${contextLine} Include repair estimates in AUD. Return JSON only.`
    : `Perform a detailed PDI damage assessment of this vehicle photo — include subtle scuffs and paint marks.${contextLine} Include per-defect and total repair estimates in AUD. Return JSON only.`;

  const visionBuffer = await prepareImageForVisionAnalysis(imageBuffer);
  const mime = imageMimeFromBuffer(visionBuffer);
  const base64 = visionBuffer.toString('base64');
  const dataUrl = `data:${mime};base64,${base64}`;

  const isGpt5Family = /^gpt-5|^o[0-9]/i.test(model);
  const tokenLimitField = isGpt5Family
    ? { max_completion_tokens: 1600 }
    : { max_tokens: 1600 };

  const requestBody: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userText,
          },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
        ],
      },
    ],
    ...tokenLimitField,
    response_format: { type: 'json_object' },
  };
  // GPT-5.x only supports default temperature — omit the parameter entirely.
  if (!isGpt5Family) {
    requestBody.temperature = 0.15;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI vision request failed: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim() || '{}';
  return parseVisionJson(content, model);
}

export function findingsToDamageMarkers(
  findings: VisionDamageFinding[],
  idPrefix = 'ai'
): { id: string; x: number; y: number; label: string }[] {
  const ts = Date.now();
  return findings.map((f, i) => {
    let label =
      f.severity && f.severity !== 'unknown' ? `${f.label} (${f.severity})` : f.label;
    if (f.repairEstimateAud) label = `${label} · est. ${f.repairEstimateAud}`;
    return {
      id: `${idPrefix}-${ts}-${i}`,
      x: f.x,
      y: f.y,
      label,
    };
  });
}
