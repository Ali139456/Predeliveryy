import type { PhotoAiDamageMetadata, VisionDamageFinding, VisionDamageResult } from '@/types/vision-damage';

function findingsToDamageMarkers(
  findings: VisionDamageFinding[],
  idPrefix = 'ai'
): { id: string; x: number; y: number; label: string }[] {
  const ts = Date.now();
  return findings.map((f, i) => {
    let label =
      f.severity && f.severity !== 'unknown' ? `${f.label} (${f.severity})` : f.label;
    if (f.repairEstimateAud) {
      label = `${label} · est. ${f.repairEstimateAud}`;
    }
    return {
      id: `${idPrefix}-${ts}-${i}`,
      x: f.x,
      y: f.y,
      label,
    };
  });
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
    repairEstimateSummary: result.repairEstimateSummary,
    totalRepairEstimateAud: result.totalRepairEstimateAud,
    findings: result.findings.map((f) => ({
      label: f.label,
      severity: f.severity,
      repairEstimateAud: f.repairEstimateAud,
      repairNotes: f.repairNotes,
    })),
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

export function formatAiDamageNotice(result: VisionDamageResult): string {
  const parts: string[] = [result.summary];
  if (result.totalRepairEstimateAud) {
    parts.push(`Indicative repair: ${result.totalRepairEstimateAud} AUD`);
  } else if (result.repairEstimateSummary) {
    parts.push(result.repairEstimateSummary);
  }
  if (result.findings.length > 0) {
    parts.push(`${result.findings.length} marker(s) placed — please confirm.`);
  }
  return parts.join(' ');
}
