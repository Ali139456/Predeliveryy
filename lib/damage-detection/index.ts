import type { VisionDamageResult } from '@/types/vision-damage';
import { detectVehicleDamageFromBuffer, isOpenAiDamageEnabled } from '@/lib/vision-damage';
import { detectVehicleDamageWithRavin, isRavinDamageEnabled } from '@/lib/damage-detection/ravin';

export type DamageDetectionOptions = {
  context?: string;
  itemName?: string;
  panelHint?: string;
};

export function isDamageDetectionEnabled(): boolean {
  if (process.env.DAMAGE_DETECTION_ENABLED === 'false') return false;
  return isRavinDamageEnabled() || isOpenAiDamageEnabled();
}

export function activeDamageDetectionProvider(): 'ravin' | 'openai' | null {
  const pref = process.env.DAMAGE_DETECTION_PROVIDER?.trim().toLowerCase();
  if (pref === 'ravin' && isRavinDamageEnabled()) return 'ravin';
  if (pref === 'openai' && isOpenAiDamageEnabled()) return 'openai';
  if (pref === 'auto' || !pref) {
    if (isOpenAiDamageEnabled()) return 'openai';
    if (isRavinDamageEnabled()) return 'ravin';
  }
  return null;
}

/** Routes to Ravin (when configured) or OpenAI vision for vehicle damage analysis. */
export async function detectVehicleDamage(
  imageBuffer: Buffer,
  options: DamageDetectionOptions = {}
): Promise<VisionDamageResult> {
  const provider = activeDamageDetectionProvider();
  if (!provider) {
    throw new Error('No damage detection provider is configured');
  }

  if (provider === 'ravin') {
    try {
      return await detectVehicleDamageWithRavin(imageBuffer, options);
    } catch (err) {
      const pref = process.env.DAMAGE_DETECTION_PROVIDER?.trim().toLowerCase();
      if (pref === 'ravin' || !isOpenAiDamageEnabled()) throw err;
      console.warn('[damage-detection] Ravin failed, falling back to OpenAI:', err);
    }
  }

  return detectVehicleDamageFromBuffer(imageBuffer, options);
}
