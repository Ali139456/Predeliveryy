import type { SupabaseClient } from '@supabase/supabase-js';
import type { InspectionChecklistCategory, InspectionRow } from '@/types/db';

const REVIEW_STATUSES = new Set(['C', 'A', 'R', 'RP']);
const DEFECT_STATUSES = new Set(['R', 'RP']);

export function extractLocationLabel(location: unknown): string {
  if (!location || typeof location !== 'object') return 'Unknown';
  const loc = location as Record<string, unknown>;
  const start = loc.start as { address?: string } | undefined;
  const current = loc.current as { address?: string } | undefined;
  const raw =
    (typeof start?.address === 'string' && start.address.trim()) ||
    (typeof current?.address === 'string' && current.address.trim()) ||
    (typeof loc.address === 'string' && loc.address.trim()) ||
    '';
  if (!raw) return 'Unknown';
  const first = raw.split(',')[0]?.trim();
  return (first || raw).slice(0, 120);
}

function countPhotos(photos: unknown): number {
  return Array.isArray(photos) ? photos.length : 0;
}

function countChecklistPhotos(checklist: InspectionChecklistCategory[]): number {
  let n = 0;
  for (const cat of checklist) {
    for (const item of cat.items || []) {
      n += countPhotos(item.photos);
    }
  }
  return n;
}

function countChecklistItems(checklist: InspectionChecklistCategory[]) {
  let total = 0;
  let ok = 0;
  let repair = 0;
  let flagged = 0;
  let hasDefect = false;
  let hasReview = false;

  for (const cat of checklist) {
    for (const item of cat.items || []) {
      total += 1;
      const status = String(item.status || '').toUpperCase();
      if (status === 'OK' || status === 'N') ok += 1;
      if (DEFECT_STATUSES.has(status)) {
        repair += 1;
        hasDefect = true;
      }
      if (REVIEW_STATUSES.has(status)) {
        hasReview = true;
      }
      if (status !== 'OK' && status !== 'N') {
        flagged += 1;
      }
    }
  }

  return {
    total,
    ok,
    repair,
    flagged,
    isPass: !hasDefect,
    needsReview: hasReview,
  };
}

export function buildAnalyticsPayload(row: InspectionRow) {
  const checklist = (row.checklist || []) as InspectionChecklistCategory[];
  const counts = countChecklistItems(checklist);
  const topPhotos = countPhotos(row.photos);
  const checklistPhotos = countChecklistPhotos(checklist);
  const locationLabel = extractLocationLabel(row.location);
  const completedAt = row.updated_at || row.created_at;
  const createdAt = row.created_at;
  const durationMinutes = (() => {
    const start = new Date(createdAt).getTime();
    const end = new Date(completedAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return Math.max(1, Math.round((end - start) / 60000));
  })();

  const summary = {
    tenant_id: row.tenant_id,
    inspection_id: row.id,
    inspection_number: row.inspection_number,
    inspector_email: row.inspector_email,
    inspector_name: row.inspector_name,
    location_label: locationLabel,
    inspection_date: row.inspection_date,
    completed_at: completedAt,
    total_items: counts.total,
    items_ok: counts.ok,
    items_repair: counts.repair,
    items_flagged: counts.flagged,
    is_pass: counts.isPass,
    needs_review: counts.needsReview,
    photo_count: topPhotos + checklistPhotos,
    duration_minutes: durationMinutes,
  };

  const items: Array<{
    tenant_id: string;
    inspection_id: string;
    inspection_number: string;
    category: string;
    item_name: string;
    status: string;
    is_defect: boolean;
    needs_review: boolean;
    photo_count: number;
    location_label: string;
    completed_at: string;
  }> = [];

  for (const cat of checklist) {
    const category = String(cat.category || 'Uncategorised').trim() || 'Uncategorised';
    for (const item of cat.items || []) {
      const status = String(item.status || 'OK').toUpperCase();
      const itemName = String(item.item || 'Item').trim() || 'Item';
      items.push({
        tenant_id: row.tenant_id,
        inspection_id: row.id,
        inspection_number: row.inspection_number,
        category,
        item_name: itemName,
        status,
        is_defect: DEFECT_STATUSES.has(status),
        needs_review: REVIEW_STATUSES.has(status),
        photo_count: countPhotos(item.photos),
        location_label: locationLabel,
        completed_at: completedAt,
      });
    }
  }

  return { summary, items };
}

export async function deleteInspectionAnalytics(
  supabase: SupabaseClient,
  inspectionId: string
): Promise<void> {
  await supabase.from('analytics_checklist_items').delete().eq('inspection_id', inspectionId);
  await supabase.from('analytics_inspection_summary').delete().eq('inspection_id', inspectionId);
}

/** Upsert flattened analytics when an inspection is completed; remove when not completed. */
export async function syncInspectionAnalytics(
  supabase: SupabaseClient,
  row: InspectionRow
): Promise<void> {
  if (row.status !== 'completed') {
    await deleteInspectionAnalytics(supabase, row.id);
    return;
  }

  const { summary, items } = buildAnalyticsPayload(row);

  await deleteInspectionAnalytics(supabase, row.id);

  const { error: summaryErr } = await supabase.from('analytics_inspection_summary').insert(summary);
  if (summaryErr) {
    throw new Error(`analytics summary insert: ${summaryErr.message}`);
  }

  if (items.length > 0) {
    const { error: itemsErr } = await supabase.from('analytics_checklist_items').insert(items);
    if (itemsErr) {
      throw new Error(`analytics items insert: ${itemsErr.message}`);
    }
  }
}
