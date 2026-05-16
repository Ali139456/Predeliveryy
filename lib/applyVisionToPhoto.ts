import type { PhotoAiDamageMetadata, VisionDamageFinding, VisionDamageResult } from '@/types/vision-damage';

function findingsToDamageMarkers(
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

export type PhotoWithAiFields = {
  fileName: string;
  url?: string;
  damageMarkers?: { id: string; x: number; y: number; label: string }[];
  metadata?: Record<string, unknown> | null;
};

/** Merge vision API result into a photo record (markers + metadata). */
export function applyVisionResultToPhoto<T extends PhotoWithAiFields>(
  photo: T,
  result: VisionDamageResult,
  options?: { mergeMarkers?: boolean }
): T {
  const mergeMarkers = options?.mergeMarkers !== false;
  const aiMarkers = findingsToDamageMarkers(result.findings);
  const existing = photo.damageMarkers ?? [];
  const manual = existing.filter((m) => !m.id.startsWith('ai-'));
  const damageMarkers = mergeMarkers
    ? [...manual, ...aiMarkers]
    : existing.length
      ? existing
      : aiMarkers;

  const aiDamage: PhotoAiDamageMetadata = {
    detectedAt: result.detectedAt || new Date().toISOString(),
    model: result.model || 'unknown',
    summary: result.summary,
    noDamageFound: result.noDamageFound,
    findingCount: result.findings.length,
  };

  return {
    ...photo,
    damageMarkers,
    metadata: {
      ...(photo.metadata || {}),
      aiDamage,
    },
  };
}
