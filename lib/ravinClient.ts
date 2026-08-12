import type { RavinIntegrationState } from '@/types/ravin';

export type RavinPublicConfig =
  | { enabled: false }
  | {
      enabled: true;
      inboundMode: 'otl' | 's3' | 'disabled';
      outboundMode: 'webhook' | 's3' | 'both';
      authMode: 'art' | 'apt';
      brand: string;
    };

export async function fetchRavinConfig(): Promise<RavinPublicConfig> {
  const res = await fetch('/api/ravin/config', { credentials: 'include' });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    config?: RavinPublicConfig;
  };
  return data.config || { enabled: false };
}

export async function createRavinOtl(
  inspectionId: string
): Promise<
  | { success: true; otlUrl: string; ravin: RavinIntegrationState }
  | { success: false; error: string }
> {
  const res = await fetch('/api/ravin/otl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ inspectionId }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    otlUrl?: string;
    ravin?: RavinIntegrationState;
    error?: string;
  };
  if (!res.ok || !data.success || !data.otlUrl) {
    return { success: false, error: data.error || `OTL request failed (${res.status})` };
  }
  return { success: true, otlUrl: data.otlUrl, ravin: data.ravin || { status: 'otl_created' } };
}

export async function submitInspectionToRavin(
  inspectionId: string
): Promise<
  | { success: true; uploaded: number; status?: string; message?: string }
  | { success: false; error: string }
> {
  const res = await fetch('/api/ravin/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ inspectionId }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    uploaded?: number;
    status?: string;
    message?: string;
    error?: string;
  };
  if (!res.ok || !data.success) {
    return { success: false, error: data.error || data.message || `Submit failed (${res.status})` };
  }
  return {
    success: true,
    uploaded: data.uploaded ?? 0,
    status: data.status,
    message: data.message,
  };
}
