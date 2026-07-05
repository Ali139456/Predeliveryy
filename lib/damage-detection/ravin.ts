import type { VisionDamageFinding, VisionDamageResult } from '@/types/vision-damage';

export function isRavinDamageEnabled(): boolean {
  return !!(
    process.env.RAVIN_API_KEY?.trim() &&
    process.env.RAVIN_DAMAGE_API_URL?.trim()
  );
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function mapSeverity(raw: unknown): VisionDamageFinding['severity'] {
  const s = String(raw ?? '').toLowerCase();
  if (s.includes('major') || s.includes('severe') || s.includes('heavy')) return 'major';
  if (s.includes('moderate') || s.includes('medium')) return 'moderate';
  if (s.includes('minor') || s.includes('light') || s.includes('small')) return 'minor';
  return 'unknown';
}

function mapConfidence(raw: unknown): VisionDamageFinding['confidence'] | undefined {
  const c = String(raw ?? '').toLowerCase();
  if (c === 'high' || c === 'medium' || c === 'low') return c;
  if (typeof raw === 'number') {
    if (raw >= 0.75) return 'high';
    if (raw >= 0.45) return 'medium';
    return 'low';
  }
  return undefined;
}

function parseRavinFindings(raw: unknown): VisionDamageFinding[] {
  if (!Array.isArray(raw)) return [];
  const out: VisionDamageFinding[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const label =
      (typeof o.label === 'string' && o.label.trim()) ||
      (typeof o.type === 'string' && o.type.trim()) ||
      (typeof o.damageType === 'string' && o.damageType.trim()) ||
      '';
    if (!label) continue;

    let x = 0.5;
    let y = 0.5;
    const bbox = o.bbox ?? o.box ?? o.location;
    if (bbox && typeof bbox === 'object') {
      const b = bbox as Record<string, unknown>;
      if (typeof b.x === 'number' && typeof b.y === 'number') {
        x = clamp01(b.x);
        y = clamp01(b.y);
      } else if (
        typeof b.left === 'number' &&
        typeof b.top === 'number' &&
        typeof b.width === 'number' &&
        typeof b.height === 'number'
      ) {
        x = clamp01(b.left + b.width / 2);
        y = clamp01(b.top + b.height / 2);
      }
    } else if (typeof o.x === 'number' && typeof o.y === 'number') {
      x = clamp01(o.x);
      y = clamp01(o.y);
    }

    out.push({
      label,
      severity: mapSeverity(o.severity ?? o.damageSeverity),
      x,
      y,
      confidence: mapConfidence(o.confidence ?? o.score),
    });
    if (out.length >= 12) break;
  }

  return out;
}

function parseRavinResponse(data: Record<string, unknown>, model: string): VisionDamageResult {
  const findings = parseRavinFindings(
    data.findings ?? data.damages ?? data.damage ?? data.results ?? data.items
  );
  const summary =
    (typeof data.summary === 'string' && data.summary.trim()) ||
    (typeof data.description === 'string' && data.description.trim()) ||
    (findings.length
      ? `${findings.length} potential issue(s) noted by Ravin AI. Technician to confirm.`
      : 'No visible damage detected in this image.');

  const noDamageFound =
    data.noDamageFound === true ||
    data.no_damage === true ||
    (findings.length === 0 && data.hasDamage !== true);

  return {
    summary: summary.slice(0, 500),
    noDamageFound: noDamageFound && findings.length === 0,
    findings,
    model,
    detectedAt: new Date().toISOString(),
  };
}

export async function detectVehicleDamageWithRavin(
  imageBuffer: Buffer,
  options: {
    context?: string;
    itemName?: string;
    panelHint?: string;
  } = {}
): Promise<VisionDamageResult> {
  const apiKey = process.env.RAVIN_API_KEY?.trim();
  const apiUrl = process.env.RAVIN_DAMAGE_API_URL?.trim();
  if (!apiKey || !apiUrl) {
    throw new Error('RAVIN_API_KEY and RAVIN_DAMAGE_API_URL are not configured');
  }

  const model = 'ravin-deepdetect';
  const contextParts: string[] = [];
  if (options.panelHint) contextParts.push(`Vehicle area / panel: ${options.panelHint}`);
  if (options.itemName) contextParts.push(`Checklist item: ${options.itemName}`);
  if (options.context) contextParts.push(options.context);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      image: imageBuffer.toString('base64'),
      contentType: 'image/jpeg',
      context: contextParts.join('. ') || undefined,
      inspectionType: 'pre-delivery',
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Ravin damage API failed: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  return parseRavinResponse(data, model);
}
