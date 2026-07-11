/** Guided general photo slots on the inspection form and report labels. */

export const GENERAL_PHOTO_SLOTS = [
  { slot: 'front', label: 'Photo – front of vehicle' },
  { slot: 'rear', label: 'Photo – rear of vehicle' },
  { slot: 'bonnet', label: 'Photo – bonnet / hood' },
  { slot: 'left', label: 'Photo – left side of vehicle' },
  { slot: 'right', label: 'Photo – right side of vehicle' },
  { slot: 'tyre_fl', label: 'Photo – front left wheel / tyre' },
  { slot: 'tyre_fr', label: 'Photo – front right wheel / tyre' },
  { slot: 'tyre_rl', label: 'Photo – rear left wheel / tyre' },
  { slot: 'tyre_rr', label: 'Photo – rear right wheel / tyre' },
] as const;

export type GeneralPhotoSlot = (typeof GENERAL_PHOTO_SLOTS)[number]['slot'];

const SLOT_LABELS: Record<string, string> = Object.fromEntries(
  GENERAL_PHOTO_SLOTS.map(({ slot, label }) => [slot, label])
);

/** Legacy single-slot tyre photos from older inspections. */
SLOT_LABELS.tyres = 'Photo – tyres / wheels';

export function generalPhotoSlotLabel(slot: string): string | undefined {
  return SLOT_LABELS[slot];
}

export function isTyreWheelSlot(slot: string | undefined): boolean {
  if (!slot) return false;
  return slot === 'tyres' || /^tyre[_-]/i.test(slot);
}
