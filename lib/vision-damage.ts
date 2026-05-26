import fs from 'fs';
import path from 'path';
import {
  downloadSupabaseStorageObject,
  hasSupabaseStorageConfig,
} from '@/lib/supabase-storage';
import { getS3Url } from '@/lib/s3';
import type { VisionDamageFinding, VisionDamageResult } from '@/types/vision-damage';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function isVisionDamageEnabled(): boolean {
  if (process.env.OPENAI_VISION_DAMAGE_ENABLED === 'false') return false;
  return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
}

export function assertTenantScopedStorageKey(storageKey: string, tenantId: string): void {
  const normalized = storageKey.replace(/^\/+/, '');
  const prefix = `tenants/${tenantId}/`;
  if (!normalized.startsWith(prefix)) {
    throw new Error('Invalid storage key for this tenant');
  }
  if (normalized.includes('..')) {
    throw new Error('Invalid storage key');
  }
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
    });
  }
  return out.slice(0, 12);
}

function parseVisionJson(content: string, model: string): VisionDamageResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
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
  };
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

  const model = process.env.OPENAI_VISION_DAMAGE_MODEL?.trim() || 'gpt-4o-mini';
  const contextParts: string[] = [];
  if (options.panelHint) contextParts.push(`Vehicle area / panel: ${options.panelHint}`);
  if (options.itemName) contextParts.push(`Checklist item: ${options.itemName}`);
  if (options.context) contextParts.push(options.context);
  const contextLine =
    contextParts.length > 0
      ? `\nInspection context: ${contextParts.join('. ')}.`
      : '';

  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  const systemPrompt = `You are an expert automotive pre-delivery inspection assistant for the Australian market.
Analyse the vehicle photo for visible exterior or tyre damage (scratches, dents, chips, cracks, rust, paint damage, misalignment, curb rash, tyre wear, sidewall damage, etc.).
Be conservative: only report damage you can reasonably see. Do not invent damage.
If the image is unclear, empty, or not a vehicle part, set noDamageFound true and explain briefly in summary.
Output ONLY valid JSON with this exact shape:
{
  "summary": "one or two sentences for the inspection report",
  "noDamageFound": boolean,
  "findings": [
    {
      "label": "short description e.g. Scratch - driver front door",
      "severity": "minor" | "moderate" | "major",
      "x": 0.0-1.0,
      "y": 0.0-1.0,
      "confidence": "high" | "medium" | "low"
    }
  ]
}
x and y are normalized coordinates (0=left/top, 1=right/bottom) for the centre of each visible defect.
Maximum 8 findings. Use Australian English.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyse this pre-delivery inspection photo for damage.${contextLine} Return JSON only.`,
            },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
          ],
        },
      ],
      max_tokens: 900,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
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
  return findings.map((f, i) => ({
    id: `${idPrefix}-${ts}-${i}`,
    x: f.x,
    y: f.y,
    label:
      f.severity && f.severity !== 'unknown'
        ? `${f.label} (${f.severity})`
        : f.label,
  }));
}
