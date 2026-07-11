import type { IInspection, InspectionChecklistCategory, InspectionPhoto } from '@/types/db';
import { getPhotoDisplayUrl } from '@/lib/photoDisplayUrl';
import {
  accessoriesBadgeOk,
  accessoriesBadgeStatus,
  batteryChecksOk,
  buildAccessoriesEvidence,
  buildBatteryEvidence,
  buildConditionEvidence,
  buildOdometerEvidence,
  buildPhotosEvidence,
  buildVinEvidence,
  reportCategoryAnchorId,
} from '@/lib/verification-badge-evidence';
import {
  isReportItemNotApplicable,
  isReportItemPass,
  isReportItemReview,
  orderChecklistForReport,
  reportCategorySummary,
  reportItemStatusLabel,
} from '@/lib/checklist-template';
import { generalPhotoSlotLabel } from '@/lib/general-photo-slots';

export { orderChecklistForReport, reportItemStatusLabel, reportCategorySummary } from '@/lib/checklist-template';

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

const AU_STATE_ABBREV: Record<string, string> = {
  'new south wales': 'NSW',
  victoria: 'VIC',
  queensland: 'QLD',
  'western australia': 'WA',
  'south australia': 'SA',
  tasmania: 'TAS',
  'northern territory': 'NT',
  'australian capital territory': 'ACT',
};

function findAustralianPostcode(parts: string[]): string | undefined {
  return parts.find((part) => /^\d{4}$/.test(part));
}

function shouldDropLocationPart(part: string, postcode?: string, stateName?: string): boolean {
  if (/^australia$/i.test(part)) return true;
  if (postcode && part === postcode) return true;
  if (stateName && part.toLowerCase() === stateName.toLowerCase()) return true;
  if (/^(sydney|melbourne|brisbane|perth|adelaide|hobart|darwin|canberra)$/i.test(part)) return true;
  if (/north shore|shire|city of|greater /i.test(part)) return true;
  return false;
}

/** Formats GPS address for reports with suburb, state and postcode. */
export function formatReportLocationAddress(raw: string, storedPostcode?: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'Not provided';

  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  const postcode = storedPostcode?.trim() || findAustralianPostcode(parts);

  const stateIdx = parts.findIndex((p) => AU_STATE_ABBREV[p.toLowerCase()]);
  const stateAbbrev = stateIdx >= 0 ? AU_STATE_ABBREV[parts[stateIdx].toLowerCase()] : undefined;
  const stateName = stateIdx >= 0 ? parts[stateIdx] : undefined;

  const kept = parts.filter((p) => !shouldDropLocationPart(p, postcode, stateName));
  const streetParts = kept.slice(0, 3);

  if (streetParts.length && stateAbbrev && postcode) {
    return `${streetParts.join(', ')} ${stateAbbrev} ${postcode}`;
  }

  let formatted = trimmed.replace(/,?\s*Australia\s*$/i, '').trim();
  if (postcode && !formatted.includes(postcode)) {
    formatted = stateAbbrev
      ? `${formatted.replace(/,?\s*$/,'')}, ${stateAbbrev} ${postcode}`
      : `${formatted.replace(/,?\s*$/,'')}, ${postcode}`;
  }
  return formatted || trimmed;
}

export function extractLocationLabel(location: unknown): string {
  if (!location || typeof location !== 'object') return 'Not provided';
  const loc = location as Record<string, unknown>;
  const start = loc.start as { address?: string; postcode?: string } | undefined;
  const current = loc.current as { address?: string; postcode?: string } | undefined;
  const storedPostcode =
    (typeof start?.postcode === 'string' && start.postcode.trim()) ||
    (typeof current?.postcode === 'string' && current.postcode.trim()) ||
    (typeof loc.postcode === 'string' && loc.postcode.trim()) ||
    undefined;
  const raw =
    (typeof start?.address === 'string' && start.address.trim()) ||
    (typeof current?.address === 'string' && current.address.trim()) ||
    (typeof loc.address === 'string' && loc.address.trim()) ||
    '';
  if (!raw) return storedPostcode ? `Postcode ${storedPostcode}` : 'Not provided';
  return formatReportLocationAddress(raw, storedPostcode);
}

/** @deprecated Use reportItemStatusLabel from checklist-template */
export const itemStatusLabel = reportItemStatusLabel;

/** @deprecated Use reportCategorySummary from checklist-template */
export const categorySummary = reportCategorySummary;

export function computeReportResult(inspection: IInspection) {
  let hasDefect = false;
  let needsReview = false;
  let total = 0;

  for (const cat of inspection.checklist || []) {
    for (const item of cat.items || []) {
      total += 1;
      if (isReportItemReview(item.status)) {
        needsReview = true;
        hasDefect = true;
      }
    }
  }

  const isPass = !needsReview;
  return { isPass, needsReview, hasDefect, total };
}

export type ReportPhoto = { url: string; label: string };

function formatSlotLabel(slot: string): string {
  return (
    generalPhotoSlotLabel(slot) ??
    slot
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
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
        add(p, `${cat.category} - ${item.item}`);
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
      if (isReportItemReview(item.status)) {
        const note = item.notes?.trim();
        lines.push(
          note
            ? `${cat.category} - ${item.item}: ${note}`
            : `${cat.category} - ${item.item} (${reportItemStatusLabel(item.status)})`
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
  anchorId: string;
  evidence: string[];
};

export { reportCategoryAnchorId } from '@/lib/verification-badge-evidence';

export function buildVerificationBadges(inspection: IInspection): VerificationBadge[] {
  const v = inspection.vehicleInfo;
  const photos = collectReportPhotos(inspection);
  const exteriorCat = (inspection.checklist || []).find((c) =>
    /exterior/i.test(c.category)
  );
  const exteriorOk = exteriorCat ? reportCategorySummary(exteriorCat).categoryPass : true;
  const batteryOk = batteryChecksOk(inspection);
  const accessoriesOk = accessoriesBadgeOk(inspection);

  return [
    {
      key: 'vin',
      label: 'VIN',
      status: v?.vin ? 'Verified' : 'Pending',
      ok: !!v?.vin,
      anchorId: 'report-field-vin',
      evidence: buildVinEvidence(inspection),
    },
    {
      key: 'odometer',
      label: 'Odometer',
      status: v?.odometer ? 'Verified' : 'Pending',
      ok: !!v?.odometer,
      anchorId: 'report-field-odometer',
      evidence: buildOdometerEvidence(inspection),
    },
    {
      key: 'condition',
      label: 'Condition',
      status: exteriorOk ? 'Verified' : 'Review',
      ok: exteriorOk,
      anchorId: reportCategoryAnchorId(exteriorCat?.category || 'Exterior'),
      evidence: buildConditionEvidence(inspection),
    },
    {
      key: 'accessories',
      label: 'Accessories',
      status: accessoriesBadgeStatus(inspection),
      ok: accessoriesOk,
      anchorId: 'report-accessories',
      evidence: buildAccessoriesEvidence(inspection),
    },
    {
      key: 'ev',
      label: 'EV Battery',
      status: batteryOk ? 'Tested' : 'Review',
      ok: batteryOk,
      anchorId: reportCategoryAnchorId('Under Bonnet'),
      evidence: buildBatteryEvidence(inspection),
    },
    {
      key: 'photos',
      label: 'Photos',
      status: photos.length > 0 ? 'Verified' : 'Pending',
      ok: photos.length > 0,
      anchorId: 'report-photos',
      evidence: buildPhotosEvidence(inspection, photos),
    },
  ];
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  return String(value);
}
