import type { InspectionChecklistCategory } from '@/types/db';

/** Supported inspection product types. */
export const INSPECTION_TYPES = ['pdi', 'blue_slip', 'pink_slip'] as const;
export type InspectionType = (typeof INSPECTION_TYPES)[number];

export function inspectionTypeLabel(type: InspectionType): string {
  switch (type) {
    case 'pdi':
      return 'Pre-Delivery Inspection';
    case 'blue_slip':
      return 'Blue Slip (AUVIS)';
    case 'pink_slip':
      return 'Pink Slip (eSafety)';
  }
}

export function inspectionTypeShortLabel(type: InspectionType): string {
  switch (type) {
    case 'pdi':
      return 'PDI';
    case 'blue_slip':
      return 'Blue Slip';
    case 'pink_slip':
      return 'Pink Slip';
  }
}

/** Infer product type from inspection number prefix (PD-, BS-, PS-). */
export function inspectionTypeFromNumber(inspectionNumber?: string | null): InspectionType | null {
  const n = String(inspectionNumber ?? '').trim().toUpperCase();
  if (/^BS[-\s]/.test(n) || /^BS\d/.test(n)) return 'blue_slip';
  if (/^PS[-\s]/.test(n) || /^PS\d/.test(n)) return 'pink_slip';
  if (/^PD[-\s]/.test(n) || /^PD\d/.test(n)) return 'pdi';
  return null;
}

/** Resolve type for list cards: number prefix wins over stored column (legacy rows). */
export function resolveInspectionType(
  inspectionNumber?: string | null,
  inspectionType?: string | null
): InspectionType {
  const fromNumber = inspectionTypeFromNumber(inspectionNumber);
  if (fromNumber) return fromNumber;
  if (inspectionType === 'blue_slip' || inspectionType === 'pink_slip' || inspectionType === 'pdi') {
    return inspectionType;
  }
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

// ---------------------------------------------------------------------------
// Blue Slip (NSW AUVIS) - identity + comprehensive safety inspection.
// Used for unregistered vehicles, imports, defect clearances, or vehicles
// out of registration for more than 3 months.
// ---------------------------------------------------------------------------
type SeedItem = { item: string; status: 'OK'; notes: string; photos: [] };
type SeedCategory = { category: string; items: SeedItem[] };

function makeItems(items: string[]): SeedItem[] {
  return items.map((item) => ({ item, status: 'OK' as const, notes: '', photos: [] }));
}

export const BLUE_SLIP_CHECKLIST_TEMPLATE: SeedCategory[] = [
  {
    category: 'Vehicle Identity Verification',
    items: makeItems([
      'VIN verified against records',
      'VIN plate authentic',
      'Compliance plate present',
      'Engine number recorded',
      'Vehicle colour verified',
      'Odometer reading recorded',
    ]),
  },
  {
    category: 'Registration & Documentation',
    items: makeItems([
      'Ownership documentation',
      'Previous registration records',
      'Import approval (if applicable)',
      'Proof of acquisition',
    ]),
  },
  {
    category: 'Exterior Condition',
    items: makeItems([
      'Body damage affecting safety',
      'Sharp edges',
      'Doors functioning',
      'Mirrors fitted',
    ]),
  },
  {
    category: 'Steering System',
    items: makeItems([
      'Steering rack secure',
      'Steering joints not worn',
      'Steering free play acceptable',
    ]),
  },
  {
    category: 'Suspension System',
    items: makeItems([
      'Springs intact',
      'Shock absorbers working',
      'Control arms secure',
      'Bushings intact',
    ]),
  },
  {
    category: 'Wheels & Tyres',
    items: makeItems([
      'Tyres compliant with regulations',
      'Tread depth adequate',
      'Wheels undamaged',
    ]),
  },
  {
    category: 'Brake System',
    items: makeItems([
      'Brake pedal function',
      'Brake fluid leaks',
      'Brake pads / shoes adequate',
      'Parking brake works',
    ]),
  },
  {
    category: 'Engine & Driveline',
    items: makeItems([
      'Oil leaks',
      'Fuel leaks',
      'Engine mounts secure',
      'Driveline secure',
    ]),
  },
  {
    category: 'Exhaust System',
    items: makeItems([
      'Exhaust secure',
      'Catalytic converter present',
      'Noise levels acceptable',
    ]),
  },
  {
    category: 'Electrical & Lighting',
    items: makeItems([
      'Headlights',
      'Indicators',
      'Brake lights',
      'Reverse lights',
      'Dashboard warning lights',
    ]),
  },
  {
    category: 'Windscreen & Visibility',
    items: makeItems([
      'Windscreen damage',
      'Wipers working',
      'Washers functioning',
      'Window tint compliant',
    ]),
  },
  {
    category: 'Seatbelts & Restraints',
    items: makeItems([
      'Seatbelts working',
      'Anchor points secure',
      'Child restraint anchors',
    ]),
  },
  {
    category: 'Structural Integrity',
    items: makeItems([
      'Chassis damage',
      'Corrosion',
      'Previous crash repairs',
    ]),
  },
];

// ---------------------------------------------------------------------------
// Pink Slip (NSW eSafety check) - annual safety inspection for cars >5 years.
// ---------------------------------------------------------------------------
export const PINK_SLIP_CHECKLIST_TEMPLATE: SeedCategory[] = [
  {
    category: 'Vehicle Identification',
    items: makeItems([
      'Registration plate matches vehicle',
      'VIN readable',
      'Odometer recorded',
    ]),
  },
  {
    category: 'Lights & Electrical',
    items: makeItems([
      'Headlights working',
      'Brake lights working',
      'Indicators functioning',
      'Hazard lights working',
      'Number plate light',
      'Horn operational',
    ]),
  },
  {
    category: 'Tyres & Wheels',
    items: makeItems([
      'Minimum tread depth',
      'Tyres free of major damage',
      'Tyres correct type for vehicle',
      'Wheel rims not cracked or bent',
      'Wheel nuts secure',
    ]),
  },
  {
    category: 'Steering & Suspension',
    items: makeItems([
      'Steering free play acceptable',
      'Steering components secure',
      'Shock absorbers not leaking',
      'Suspension components secure',
      'No excessive movement in joints',
    ]),
  },
  {
    category: 'Brakes',
    items: makeItems([
      'Brake pedal operation',
      'Brake system free of leaks',
      'Brake pad thickness adequate',
      'Handbrake operational',
    ]),
  },
  {
    category: 'Windscreen & Wipers',
    items: makeItems([
      'Windscreen not cracked in driver view',
      'Wipers working',
      'Washer jets functioning',
    ]),
  },
  {
    category: 'Seatbelts & Seats',
    items: makeItems([
      'Seatbelts retract correctly',
      'Seatbelt anchor points secure',
      'Seats securely mounted',
    ]),
  },
  {
    category: 'Body & Structure',
    items: makeItems([
      'Doors open and latch properly',
      'No dangerous rust',
      'Bonnet latch secure',
    ]),
  },
  {
    category: 'Exhaust & Emissions',
    items: makeItems([
      'Exhaust secure',
      'No excessive smoke',
      'No major leaks',
    ]),
  },
  {
    category: 'Road Test',
    items: makeItems([
      'Vehicle drives normally',
      'No abnormal steering behaviour',
      'No braking issues',
    ]),
  },
];

/**
 * Returns the seed checklist for a given inspection type. The PDI template
 * lives in `components/InspectionForm.tsx` as `defaultChecklist`; this helper
 * only knows the Blue/Pink variants. Callers handle the PDI default.
 */
export function getNonPdiChecklistTemplate(type: InspectionType): SeedCategory[] | null {
  if (type === 'blue_slip') return BLUE_SLIP_CHECKLIST_TEMPLATE;
  if (type === 'pink_slip') return PINK_SLIP_CHECKLIST_TEMPLATE;
  return null;
}

