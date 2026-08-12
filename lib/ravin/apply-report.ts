import type { IInspection, InspectionPhoto } from '@/types/db';
import type { RavinIntegrationState, RavinParsedReport } from '@/types/ravin';
import type { PhotoAiDamageMetadata } from '@/types/vision-damage';
import { applyVisionResultToPhoto } from '@/lib/applyVisionToPhoto';

function photoStorageKey(photo: InspectionPhoto | string): string {
  if (typeof photo === 'string') return photo;
  return photo.fileName || '';
}

/** Merge Ravin webhook report into inspection photos and ravin_integration state. */
export function applyRavinReportToInspection(
  inspection: IInspection,
  report: RavinParsedReport
): { inspection: IInspection; ravin: RavinIntegrationState } {
  const photos = [...(inspection.photos || [])].map((p) =>
    typeof p === 'string' ? { fileName: p } : { ...p }
  );

  const visionResult = {
    summary: report.summary || 'Ravin AI inspection completed.',
    noDamageFound: report.findings.length === 0,
    findings: report.findings,
    model: 'ravin-eye',
    detectedAt: new Date().toISOString(),
    totalRepairEstimateAud: report.totalRepairEstimate,
    repairEstimateSummary: report.totalRepairEstimate
      ? `Indicative total repair: ${report.totalRepairEstimate}`
      : undefined,
  };

  // Apply findings to the first exterior photo, or first photo with a slot
  let targetIdx = photos.findIndex((p) => {
    const meta = (typeof p === 'object' && p.metadata) as Record<string, unknown> | undefined;
    return meta?.slot === 'front' || meta?.slot === 'left' || meta?.slot === 'right';
  });
  if (targetIdx < 0 && photos.length > 0) targetIdx = 0;

  if (targetIdx >= 0 && report.findings.length > 0) {
    photos[targetIdx] = applyVisionResultToPhoto(
      photos[targetIdx] as Parameters<typeof applyVisionResultToPhoto>[0],
      visionResult
    ) as InspectionPhoto;
  }

  // Also stamp checklist exterior item photos if present
  const checklist = (inspection.checklist || []).map((cat) => ({
    ...cat,
    items: cat.items.map((item) => {
      if (!item.photos?.length || !report.findings.length) return item;
      const nextPhotos = item.photos.map((p, idx) =>
        idx === 0
          ? (applyVisionResultToPhoto(
              p as Parameters<typeof applyVisionResultToPhoto>[0],
              visionResult
            ) as typeof p)
          : p
      );
      return { ...item, photos: nextPhotos };
    }),
  }));

  const ravin: RavinIntegrationState = {
    status: 'completed',
    invitationId: report.invitationId || inspection.id,
    completedAt: new Date().toISOString(),
    reportPdfUrl: report.reportPdfUrl,
    summary: report.summary,
    damageCount: report.findings.length,
    findings: report.findings,
    totalRepairEstimate: report.totalRepairEstimate,
    rawPayload: {
      elementCount: report.rawElements.length,
      invitationId: report.invitationId,
    },
  };

  return {
    inspection: {
      ...inspection,
      photos,
      checklist,
    },
    ravin,
  };
}

export function buildAiDamageFromRavin(ravin: RavinIntegrationState): PhotoAiDamageMetadata | null {
  if (!ravin.summary || ravin.status !== 'completed') return null;
  return {
    detectedAt: ravin.completedAt || new Date().toISOString(),
    model: 'ravin-eye',
    summary: ravin.summary,
    noDamageFound: (ravin.damageCount ?? 0) === 0,
    findingCount: ravin.damageCount ?? 0,
    totalRepairEstimateAud: ravin.totalRepairEstimate,
    findings: ravin.findings?.map((f) => ({
      label: f.label,
      severity: f.severity,
      repairEstimateAud: f.repairEstimateAud,
      repairNotes: f.repairNotes,
    })),
  };
}

export function collectInspectionPhotoKeys(inspection: IInspection): { key: string; slot?: string }[] {
  const out: { key: string; slot?: string }[] = [];
  for (const photo of inspection.photos || []) {
    const key = photoStorageKey(photo);
    if (!key) continue;
    const slot = (photo.metadata as Record<string, unknown> | undefined)?.slot;
    out.push({ key, slot: typeof slot === 'string' ? slot : undefined });
  }
  return out;
}
