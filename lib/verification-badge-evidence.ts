import type { IInspection, InspectionChecklistCategory } from '@/types/db';
import { getSelectedDealerAccessoryLabels } from '@/lib/dealer-accessories';
import {
  reportCategorySummary,
  reportItemStatusLabel,
} from '@/lib/checklist-template';

export function reportCategoryAnchorId(category: string): string {
  return `report-cat-${category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

type ChecklistHit = {
  category: string;
  item: string;
  status: string;
  notes?: string;
};

export function findChecklistItem(inspection: IInspection, pattern: RegExp): ChecklistHit | null {
  for (const cat of inspection.checklist || []) {
    for (const item of cat.items || []) {
      if (pattern.test(item.item)) {
        return {
          category: cat.category,
          item: item.item,
          status: item.status,
          notes: item.notes,
        };
      }
    }
  }
  return null;
}

function itemEvidenceLine(hit: ChecklistHit | null): string | null {
  if (!hit) return null;
  const status = reportItemStatusLabel(hit.status);
  const note = hit.notes?.trim();
  return note ? `${hit.item}: ${status} — ${note}` : `${hit.item}: ${status}`;
}

function categoryEvidenceLines(category: InspectionChecklistCategory | undefined): string[] {
  if (!category) return ['No checklist data recorded'];
  const summary = reportCategorySummary(category);
  const lines = [`${summary.passed} / ${summary.total} checks passed in ${category.category}`];
  for (const item of category.items || []) {
    const label = reportItemStatusLabel(item.status);
    if (label === 'REVIEW') {
      lines.push(`${item.item}: ${label}`);
    }
  }
  return lines;
}

export function buildVinEvidence(inspection: IInspection): string[] {
  const v = inspection.vehicleInfo;
  const lines: string[] = [];
  if (v?.vin) lines.push(`VIN recorded: ${v.vin}`);
  if (inspection.barcode?.trim()) lines.push(`Barcode scan: ${inspection.barcode.trim()}`);
  if (lines.length === 0) lines.push('No VIN or barcode recorded on this inspection');
  return lines;
}

export function buildOdometerEvidence(inspection: IInspection): string[] {
  const reading = inspection.vehicleInfo?.odometer?.trim();
  if (reading) return [`Odometer reading: ${reading}`];
  return ['No odometer reading recorded'];
}

export function buildConditionEvidence(inspection: IInspection): string[] {
  const exterior = (inspection.checklist || []).find((c) => /exterior/i.test(c.category));
  const appearance = (inspection.checklist || []).find((c) => /final appearance/i.test(c.category));
  const lines = categoryEvidenceLines(exterior);
  if (appearance) lines.push(...categoryEvidenceLines(appearance));
  return lines;
}

export function buildAccessoriesEvidence(inspection: IInspection): string[] {
  const labels = getSelectedDealerAccessoryLabels(inspection.dealerAccessoriesFitted);
  const qcItem = findChecklistItem(inspection, /dealer-fitted accessories/i);
  const lines: string[] = [];
  if (labels.length) lines.push(`Fitted: ${labels.join(', ')}`);
  const qcLine = itemEvidenceLine(qcItem);
  if (qcLine) lines.push(qcLine);
  if (!lines.length) lines.push('No dealer accessories selected or checklist item recorded');
  return lines;
}

export function buildBatteryEvidence(inspection: IInspection): string[] {
  const underBonnet = findChecklistItem(inspection, /battery terminals/i);
  const finalCheck = findChecklistItem(inspection, /battery final check/i);
  const lines = [itemEvidenceLine(underBonnet), itemEvidenceLine(finalCheck)].filter(
    (l): l is string => !!l
  );
  return lines.length ? lines : ['No battery check items recorded'];
}

export function batteryChecksOk(inspection: IInspection): boolean {
  const hits = [
    findChecklistItem(inspection, /battery terminals/i),
    findChecklistItem(inspection, /battery final check/i),
  ].filter((h): h is ChecklistHit => !!h);

  if (!hits.length) return false;
  return hits.every((h) => {
    const label = reportItemStatusLabel(h.status);
    return label === 'PASS' || label === 'N/A';
  });
}

export function buildPhotosEvidence(inspection: IInspection, photos: { label: string }[]): string[] {
  if (!photos.length) return ['No inspection photos attached'];
  const lines = [`${photos.length} photo${photos.length === 1 ? '' : 's'} captured`];
  for (const p of photos.slice(0, 4)) {
    lines.push(p.label);
  }
  if (photos.length > 4) lines.push(`+ ${photos.length - 4} more`);
  return lines;
}

export function accessoriesBadgeOk(inspection: IInspection): boolean {
  const hasSelected = getSelectedDealerAccessoryLabels(inspection.dealerAccessoriesFitted).length > 0;
  const qcItem = findChecklistItem(inspection, /dealer-fitted accessories/i);
  const qcPass = qcItem ? reportItemStatusLabel(qcItem.status) === 'PASS' : false;
  return hasSelected || qcPass;
}

export function accessoriesBadgeStatus(inspection: IInspection): string {
  if (getSelectedDealerAccessoryLabels(inspection.dealerAccessoriesFitted).length > 0) return 'Verified';
  const qcItem = findChecklistItem(inspection, /dealer-fitted accessories/i);
  if (qcItem && reportItemStatusLabel(qcItem.status) === 'PASS') return 'Verified';
  if (qcItem && reportItemStatusLabel(qcItem.status) === 'N/A') return 'N/A';
  return 'None recorded';
}
