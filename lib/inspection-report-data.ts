import type { IInspection, InspectionChecklistCategory, InspectionPhoto } from '@/types/db';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';

const DEFECT_STATUSES = new Set(['R', 'RP']);
const REVIEW_STATUSES = new Set(['C', 'A', 'R', 'RP']);

const PDF_TIMEZONE_AU_EASTERN = 'Australia/Sydney';

export function formatReportDateTime(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d
    .toLocaleString('en-AU', {
      timeZone: PDF_TIMEZONE_AU_EASTERN,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    })
    .toUpperCase();
}

export function formatReportDate(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d
    .toLocaleDateString('en-AU', {
      timeZone: PDF_TIMEZONE_AU_EASTERN,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

export function extractLocationLabel(location: unknown): string {
  if (!location || typeof location !== 'object') return 'Not provided';
  const loc = location as Record<string, unknown>;
  const start = loc.start as { address?: string } | undefined;
  const current = loc.current as { address?: string } | undefined;
  const raw =
    (typeof start?.address === 'string' && start.address.trim()) ||
    (typeof current?.address === 'string' && current.address.trim()) ||
    (typeof loc.address === 'string' && loc.address.trim()) ||
    '';
  return raw || 'Not provided';
}

export function getVehicleTitle(inspection: IInspection): string {
  const v = inspection.vehicleInfo;
  if (!v) return 'Vehicle not specified';
  const parts = [v.year, v.make, v.model].filter(Boolean);
  if (parts.length) return parts.join(' ').toUpperCase();
  return v.vin ? `VIN ${v.vin}` : 'Vehicle';
}

export function normalizeItemStatus(status: string): string {
  return String(status || '').trim().toUpperCase();
}

export function itemStatusLabel(status: string): string {
  const s = normalizeItemStatus(status);
  if (s === 'OK' || s === 'N' || s === 'C') return 'PASS';
  if (s === 'R' || s === 'RP') return 'REPAIR';
  if (s === 'A') return 'ADJUST';
  if (s === 'PASS') return 'PASS';
  if (s === 'FAIL') return 'FAIL';
  return s || '—';
}

export function isItemPassing(status: string): boolean {
  const s = normalizeItemStatus(status);
  return s === 'OK' || s === 'N' || s === 'C' || s === 'PASS';
}

export function categorySummary(category: InspectionChecklistCategory) {
  const items = category.items || [];
  const total = items.length;
  const passed = items.filter((i) => isItemPassing(i.status)).length;
  const hasDefect = items.some((i) => DEFECT_STATUSES.has(normalizeItemStatus(i.status)));
  const categoryPass = total > 0 && !hasDefect && passed === total;
  return { total, passed, categoryPass, hasDefect };
}

export function computeReportResult(inspection: IInspection) {
  let hasDefect = false;
  let needsReview = false;
  let total = 0;

  for (const cat of inspection.checklist || []) {
    for (const item of cat.items || []) {
      total += 1;
      const s = normalizeItemStatus(item.status);
      if (DEFECT_STATUSES.has(s)) hasDefect = true;
      if (REVIEW_STATUSES.has(s)) needsReview = true;
    }
  }

  const isPass = !hasDefect;
  return { isPass, needsReview, hasDefect, total };
}

export type ReportPhoto = { url: string; label: string };

function formatSlotLabel(slot: string): string {
  return slot
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function collectReportPhotos(inspection: IInspection): ReportPhoto[] {
  const out: ReportPhoto[] = [];
  const seen = new Set<string>();

  const add = (photo: string | InspectionPhoto, label: string) => {
    const url = getPhotoDisplayUrl(photo);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url, label });
  };

  for (const p of inspection.photos || []) {
    const meta = typeof p === 'object' && p?.metadata ? (p.metadata as { slot?: string }) : undefined;
    const slot = meta?.slot;
    add(p, slot ? formatSlotLabel(String(slot)) : 'General photo');
  }

  for (const cat of inspection.checklist || []) {
    for (const item of cat.items || []) {
      for (const p of item.photos || []) {
        add(p, `${cat.category} — ${item.item}`);
      }
    }
  }

  return out;
}

export function getHeroPhotoUrl(inspection: IInspection): string | null {
  const photos = collectReportPhotos(inspection);
  const prefer = photos.find((p) =>
    /front|exterior|hero|vehicle/i.test(p.label)
  );
  return prefer?.url ?? photos[0]?.url ?? null;
}

export function buildReportNotes(inspection: IInspection): string {
  const lines: string[] = [];
  for (const cat of inspection.checklist || []) {
    for (const item of cat.items || []) {
      const s = normalizeItemStatus(item.status);
      if (DEFECT_STATUSES.has(s) || s === 'A') {
        const note = item.notes?.trim();
        lines.push(
          note
            ? `${cat.category} — ${item.item}: ${note}`
            : `${cat.category} — ${item.item} (${itemStatusLabel(item.status)})`
        );
      }
    }
  }
  const { isPass } = computeReportResult(inspection);
  if (lines.length === 0) {
    return isPass
      ? 'No issues noted. Vehicle is in good condition and ready for delivery.'
      : 'See checklist items marked for repair or adjustment.';
  }
  return lines.join(' ');
}

export type VerificationBadge = {
  key: string;
  label: string;
  status: string;
  ok: boolean;
};

export function buildVerificationBadges(inspection: IInspection): VerificationBadge[] {
  const v = inspection.vehicleInfo;
  const photos = collectReportPhotos(inspection);
  const exteriorCat = (inspection.checklist || []).find((c) =>
    /exterior/i.test(c.category)
  );
  const exteriorOk = exteriorCat ? categorySummary(exteriorCat).categoryPass : true;

  return [
    {
      key: 'vin',
      label: 'VIN',
      status: v?.vin ? 'Verified' : 'Pending',
      ok: !!v?.vin,
    },
    {
      key: 'odometer',
      label: 'Odometer',
      status: v?.odometer ? 'Verified' : 'Pending',
      ok: !!v?.odometer,
    },
    {
      key: 'condition',
      label: 'Condition',
      status: exteriorOk ? 'Verified' : 'Review',
      ok: exteriorOk,
    },
    {
      key: 'accessories',
      label: 'Accessories',
      status: 'Fitted',
      ok: true,
    },
    {
      key: 'ev',
      label: 'EV Battery',
      status: 'Tested',
      ok: true,
    },
    {
      key: 'photos',
      label: 'Photos',
      status: photos.length > 0 ? 'Verified' : 'Pending',
      ok: photos.length > 0,
    },
  ];
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  return String(value);
}
