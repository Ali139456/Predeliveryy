import type { InspectionChecklistCategory } from '@/types/db';

/** Supported inspection product type (PDI only). */
export const INSPECTION_TYPES = ['pdi'] as const;
export type InspectionType = (typeof INSPECTION_TYPES)[number];

export function inspectionTypeLabel(_type?: InspectionType | string | null): string {
  return 'Pre-Delivery Inspection';
}

export function inspectionTypeShortLabel(_type?: InspectionType | string | null): string {
  return 'PDI';
}

/** Resolve type for list cards; always PDI. */
export function resolveInspectionType(
  _inspectionNumber?: string | null,
  _inspectionType?: string | null
): InspectionType {
  return 'pdi';
}

/** Matches `defaultChecklist` category order in InspectionForm */
export const CHECKLIST_CATEGORY_ORDER = [
  'Pre delivery Inspection',
  'Exterior',
  'Interior – Install/Set',
  'Interior – Function Check',
  'Under Vehicle',
  'Under Bonnet',
  'Final QC',
  'Final Appearance',
] as const;

/** App form action codes (InspectionForm zod enum) */
export const CHECKLIST_ITEM_STATUSES = ['OK', 'C', 'A', 'R', 'RP', 'N'] as const;
export type ChecklistItemStatus = (typeof CHECKLIST_ITEM_STATUSES)[number];

export function normalizeChecklistStatus(status: string): string {
  return String(status || '')
    .trim()
    .replace(/['"]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

/** Report display: OK → PASS; N → N/A; C/A/R/RP → REVIEW */
export function reportItemStatusLabel(status: string): string {
  const s = normalizeChecklistStatus(status);
  if (s === 'OK' || s === 'PASS') return 'PASS';
  if (s === 'N') return 'N/A';
  if (s === 'C' || s === 'A' || s === 'R' || s === 'RP' || s === 'FAIL') return 'REVIEW';
  return s || '-';
}

export function isReportItemPass(status: string): boolean {
  const s = normalizeChecklistStatus(status);
  return s === 'OK' || s === 'PASS';
}

export function isReportItemNotApplicable(status: string): boolean {
  return normalizeChecklistStatus(status) === 'N';
}

export function isReportItemReview(status: string): boolean {
  const s = normalizeChecklistStatus(status);
  return s === 'C' || s === 'A' || s === 'R' || s === 'RP' || s === 'FAIL';
}

export function orderChecklistForReport(
  checklist: InspectionChecklistCategory[]
): InspectionChecklistCategory[] {
  if (!checklist?.length) return [];
  const used = new Set<InspectionChecklistCategory>();
  const sorted: InspectionChecklistCategory[] = [];

  for (const name of CHECKLIST_CATEGORY_ORDER) {
    const found = checklist.find(
      (c) => c.category.trim().toLowerCase() === name.toLowerCase()
    );
    if (found && !used.has(found)) {
      sorted.push(found);
      used.add(found);
    }
  }

  for (const cat of checklist) {
    if (!used.has(cat)) sorted.push(cat);
  }

  return sorted;
}

export function reportCategorySummary(category: InspectionChecklistCategory) {
  const items = category.items || [];
  const applicable = items.filter((i) => !isReportItemNotApplicable(i.status));
  const total = applicable.length;
  const passed = applicable.filter((i) => isReportItemPass(i.status)).length;
  const needsReview = items.some((i) => isReportItemReview(i.status));
  const categoryPass = total > 0 && passed === total && !needsReview;

  return { total, passed, needsReview, categoryPass };
}
