/** Dealer-fitted accessories — each option maps to its own boolean field for reporting/export. */

export const DEALER_ACCESSORY_OPTIONS = [
  { key: 'bullBar', label: 'Bull bar' },
  { key: 'towBar', label: 'Tow bar' },
  { key: 'nudgeBars', label: 'Nudge bars' },
  { key: 'roofRacks', label: 'Roof racks' },
  { key: 'carpetMats', label: 'Carpet mats' },
  { key: 'windowTints', label: 'Window tints' },
  { key: 'bonnetProjector', label: 'Bonnet projector' },
  { key: 'doorWindProtector', label: 'Door wind protector' },
  { key: 'bootLiner', label: 'Boot liner' },
  { key: 'evPortableCharger', label: 'EV: portable charger' },
] as const;

export type DealerAccessoryKey = (typeof DEALER_ACCESSORY_OPTIONS)[number]['key'];

export type DealerAccessoriesFitted = Partial<Record<DealerAccessoryKey, boolean>>;

export function createEmptyDealerAccessories(): DealerAccessoriesFitted {
  return {};
}

export function normalizeDealerAccessories(raw: unknown): DealerAccessoriesFitted {
  if (!raw || typeof raw !== 'object') return createEmptyDealerAccessories();
  const src = raw as Record<string, unknown>;
  const out: DealerAccessoriesFitted = {};
  for (const { key } of DEALER_ACCESSORY_OPTIONS) {
    if (src[key] === true) out[key] = true;
  }
  return out;
}

export function getSelectedDealerAccessoryLabels(
  fitted: DealerAccessoriesFitted | undefined | null
): string[] {
  if (!fitted) return [];
  return DEALER_ACCESSORY_OPTIONS.filter(({ key }) => fitted[key] === true).map(({ label }) => label);
}

export function hasDealerAccessoriesSelected(fitted: DealerAccessoriesFitted | undefined | null): boolean {
  return getSelectedDealerAccessoryLabels(fitted).length > 0;
}

export function formatDealerAccessoriesForReport(
  fitted: DealerAccessoriesFitted | undefined | null
): string {
  const labels = getSelectedDealerAccessoryLabels(fitted);
  return labels.length > 0 ? labels.join(', ') : 'None recorded';
}
