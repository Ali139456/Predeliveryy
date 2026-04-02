import { z } from 'zod';

const looseRecord = z.record(z.string(), z.unknown());

/** Bounds for inspection JSON from clients; rejects oversized payloads and invalid enums. */
const inspectionBodySchema = z.object({
  inspectionNumber: z.string().max(120).optional(),
  inspectorName: z.string().max(200).optional(),
  inspectorEmail: z.string().email().max(320).optional(),
  inspectionDate: z.string().max(64).optional(),
  location: looseRecord.optional(),
  barcode: z.union([z.string().max(500), z.null()]).optional(),
  vehicleInfo: looseRecord.optional(),
  checklist: z.array(z.unknown()).max(400).optional(),
  photos: z.array(z.unknown()).max(600).optional(),
  walkAroundVideos: z.array(z.unknown()).max(100).optional(),
  status: z.enum(['draft', 'completed']).optional(),
  signatures: looseRecord.optional(),
  privacyConsent: z.boolean().optional(),
  dataRetentionDays: z.number().int().min(1).max(3650).optional(),
  tenantId: z.string().uuid().optional(),
});

export type InspectionParseResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

export function parseInspectionApiBody(body: unknown, mode: 'create' | 'update'): InspectionParseResult {
  const r = inspectionBodySchema.safeParse(body);
  if (!r.success) {
    const msg = r.error.issues.map((e) => e.message).join('; ') || 'Invalid inspection data';
    return { ok: false, error: msg };
  }
  if (mode === 'create') {
    if (!r.data.inspectorName?.trim()) {
      return { ok: false, error: 'Inspector name is required' };
    }
    if (!r.data.inspectorEmail?.trim()) {
      return { ok: false, error: 'Inspector email is required' };
    }
    if (!r.data.inspectionDate?.trim()) {
      return { ok: false, error: 'Inspection date is required' };
    }
  }
  return { ok: true, data: { ...r.data } as Record<string, unknown> };
}
