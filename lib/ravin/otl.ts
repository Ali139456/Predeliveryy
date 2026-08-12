import type { RavinConfig } from '@/lib/ravin/config';
import { resolvePartnerToken } from '@/lib/ravin/auth';
import type { IInspection } from '@/types/db';
import type { RavinPartnerInviteResponse } from '@/types/ravin';

export function buildPartnerInvitePayload(
  inspection: IInspection,
  partnerToken: string,
  config: RavinConfig
): Record<string, unknown> {
  const v = inspection.vehicleInfo || {};
  const invitationId = inspection.id;

  const payload: Record<string, unknown> = {
    partnerToken,
    siteId: config.siteId,
    provider: config.provider,
    linkExpiredIn: config.linkExpiredInHours,
    loginExpiredIn: config.loginExpiredInHours,
    invitationId,
    brand: config.brand,
    requestor: inspection.inspectorName || 'Technician',
  };

  if (v.vin?.trim()) payload.vin = v.vin.trim();
  if (v.licensePlate?.trim()) {
    payload.registrationNumber = v.licensePlate.trim();
    payload.lp = v.licensePlate.trim();
  }
  if (v.make?.trim()) payload.make = v.make.trim();
  if (v.model?.trim()) payload.model = v.model.trim();
  if (v.year?.trim()) payload.year = v.year.trim();
  if (inspection.inspectionNumber?.trim()) payload.claimId = inspection.inspectionNumber.trim();

  return payload;
}

function normalizeOtlUrl(message: string): string {
  const trimmed = message.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

export async function createRavinOtl(
  inspection: IInspection,
  config: RavinConfig
): Promise<{ url: string; traceId?: string; expirationTimestamp?: string }> {
  const partnerToken = await resolvePartnerToken(config, inspection.id);
  const payload = buildPartnerInvitePayload(inspection, partnerToken, config);

  const res = await fetch(`${config.apiBaseUrl}/partnerInvite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = (await res.json()) as RavinPartnerInviteResponse;
    if (!res.ok || data.error) {
      throw new Error(data.error || `Ravin partnerInvite failed (${res.status})`);
    }
    if (!data.message?.trim()) {
      throw new Error('Ravin partnerInvite returned no link');
    }
    return {
      url: normalizeOtlUrl(data.message),
      traceId: data.traceId,
      expirationTimestamp: data.expirationTimestamp,
    };
  }

  const text = (await res.text()).trim();
  if (!res.ok || !text) {
    throw new Error(`Ravin partnerInvite failed (${res.status})`);
  }
  return { url: normalizeOtlUrl(text) };
}
