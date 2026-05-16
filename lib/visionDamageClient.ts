import type { VisionDamageResult } from '@/types/vision-damage';

export type VisionDamageDetectRequest = {
  storageKey: string;
  itemName?: string;
  panelHint?: string;
  context?: string;
};

export async function requestVisionDamageDetect(
  body: VisionDamageDetectRequest
): Promise<{ success: true; result: VisionDamageResult } | { success: false; error: string; disabled?: boolean }> {
  const res = await fetch('/api/vision/damage-detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    result?: VisionDamageResult;
    error?: string;
    disabled?: boolean;
  };
  if (!res.ok || !data.success || !data.result) {
    return {
      success: false,
      error: data.error || `Damage detection failed (${res.status})`,
      disabled: data.disabled,
    };
  }
  return { success: true, result: data.result };
}
