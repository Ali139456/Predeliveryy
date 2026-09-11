import { resolvePartnerToken } from '@/lib/ravin/auth';
import type { RavinConfig } from '@/lib/ravin/config';
import type { RavinParsedReport, RavinPresignedPostFields } from '@/types/ravin';
import type { VisionDamageFinding, DamageSeverity } from '@/types/vision-damage';

function mapSeverity(raw: unknown): DamageSeverity {
  if (typeof raw === 'number') {
    if (raw >= 3) return 'major';
    if (raw === 2) return 'moderate';
    if (raw === 1) return 'minor';
  }
  const s = String(raw ?? '').toLowerCase();
  if (s.includes('major') || s.includes('severe') || s.includes('heavy')) return 'major';
  if (s.includes('moderate') || s.includes('medium')) return 'moderate';
  if (s.includes('minor') || s.includes('light') || s.includes('small')) return 'minor';
  return 'unknown';
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function parseDamageItem(item: Record<string, unknown>): VisionDamageFinding | null {
  const label =
    (typeof item.damageTypeName === 'string' && item.damageTypeName.trim()) ||
    (typeof item.damageDescription === 'string' && item.damageDescription.trim()) ||
    (typeof item.partName === 'string' && item.partName.trim()) ||
    '';
  if (!label) return null;

  let x = 0.5;
  let y = 0.5;
  const imagesPos = item.__imagesPos__;
  if (Array.isArray(imagesPos) && imagesPos[0] && typeof imagesPos[0] === 'object') {
    const pos = imagesPos[0] as Record<string, unknown>;
    const rect = pos.rect;
    if (Array.isArray(rect) && rect.length >= 4) {
      const left = Number(rect[0]);
      const top = Number(rect[1]);
      const width = Number(rect[3]);
      const height = Number(rect[2]);
      if (Number.isFinite(left) && Number.isFinite(top)) {
        x = clamp01((left + (width || 0) / 2) / 1000);
        y = clamp01((top + (height || 0) / 2) / 1000);
      }
    }
  }

  const cost = item.cost;
  const currency = item.currency as Record<string, unknown> | undefined;
  let repairEstimateAud: string | undefined;
  if (typeof cost === 'number' && currency?.sign) {
    repairEstimateAud = `${currency.sign}${cost.toFixed(0)}`;
  }

  const partName = typeof item.partName === 'string' ? item.partName : undefined;
  const locationName = typeof item.locationName === 'string' ? item.locationName : undefined;
  const fullLabel = [label, partName, locationName].filter(Boolean).join(' · ');

  return {
    label: fullLabel.slice(0, 120),
    severity: mapSeverity(item.severity),
    x,
    y,
    repairEstimateAud,
    repairNotes:
      typeof item.damageDescription === 'string' ? item.damageDescription.slice(0, 200) : undefined,
  };
}

function extractInvitationId(payload: Record<string, unknown>): string | undefined {
  for (const key of ['invitationId', 'invitation_id', 'externalId', 'external_id']) {
    const v = payload[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }

  const elements = payload.elements ?? payload.data ?? payload.items ?? payload.metadata;
  if (Array.isArray(elements)) {
    for (const el of elements) {
      if (!el || typeof el !== 'object') continue;
      const o = el as Record<string, unknown>;
      if (o.key === 'invitationId' || o.key === 'invitation_id') {
        const val = o.value;
        if (typeof val === 'string') return val;
      }
    }
  }
  return undefined;
}

function extractPdfUrl(payload: Record<string, unknown>): string | undefined {
  for (const key of ['pdfUrl', 'pdf_url', 'reportPdfUrl', 'report_url', 'pdf']) {
    const v = payload[key];
    if (typeof v === 'string' && v.startsWith('http')) return v;
  }

  const elements = payload.elements ?? payload.data ?? payload.items;
  if (Array.isArray(elements)) {
    for (const el of elements) {
      if (!el || typeof el !== 'object') continue;
      const o = el as Record<string, unknown>;
      const key = String(o.key ?? '').toLowerCase();
      if (key.includes('pdf') || key.includes('report')) {
        const val = o.value;
        if (typeof val === 'string' && val.startsWith('http')) return val;
      }
    }
  }
  return undefined;
}

/** Parse Ravin Appendix B webhook / S3 JSON into normalized findings. */
export function parseRavinReportPayload(body: unknown): RavinParsedReport {
  const findings: VisionDamageFinding[] = [];
  const rawElements: unknown[] = [];
  let totalCost = 0;
  let currencySign = '$';

  const root =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : ({} as Record<string, unknown>);

  const invitationId = extractInvitationId(root);
  const reportPdfUrl = extractPdfUrl(root);

  const collections = [
    root.elements,
    root.data,
    root.items,
    root.results,
    root.damages,
    root.payload,
  ].filter(Array.isArray) as unknown[][];

  for (const collection of collections) {
    for (const el of collection) {
      rawElements.push(el);
      if (!el || typeof el !== 'object') continue;
      const o = el as Record<string, unknown>;
      const value = o.value;

      if (Array.isArray(value)) {
        for (const item of value) {
          if (!item || typeof item !== 'object') continue;
          const damage = item as Record<string, unknown>;
          if (
            damage.damageid != null ||
            damage.damageType != null ||
            damage.damageTypeName != null
          ) {
            const parsed = parseDamageItem(damage);
            if (parsed) {
              findings.push(parsed);
              const cost = Number(damage.cost);
              if (Number.isFinite(cost)) {
                totalCost += cost;
                const cur = damage.currency as Record<string, unknown> | undefined;
                if (typeof cur?.sign === 'string') currencySign = cur.sign;
              }
            }
          }
        }
      }
    }
  }

  // Flat damage array fallback
  const flatDamages = root.damages ?? root.damage ?? root.findings;
  if (Array.isArray(flatDamages)) {
    for (const item of flatDamages) {
      if (item && typeof item === 'object') {
        const parsed = parseDamageItem(item as Record<string, unknown>);
        if (parsed) findings.push(parsed);
      }
    }
  }

  const summary =
    (typeof root.summary === 'string' && root.summary.trim()) ||
    (findings.length
      ? `${findings.length} damage(s) detected by Ravin AI. Technician to confirm.`
      : 'Ravin AI inspection completed — no damage detected.');

  return {
    invitationId,
    summary: summary.slice(0, 500),
    reportPdfUrl,
    findings: findings.slice(0, 50),
    totalRepairEstimate: totalCost > 0 ? `${currencySign}${totalCost.toFixed(0)}` : undefined,
    rawElements,
  };
}

export async function fetchRavinPresignedPost(
  config: RavinConfig,
  params: {
    inspectionId: string;
    vehicleId?: string;
    fileName: string;
  }
): Promise<RavinPresignedPostFields> {
  const authToken = await resolvePartnerToken(config, params.inspectionId);

  const presignUrl =
    config.s3PresignUrl || `${config.apiBaseUrl}/getS3UploadPolicy`;

  const res = await fetch(presignUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      inspectionId: params.inspectionId,
      vehicleId: params.vehicleId,
      fileName: params.fileName,
      key: `uploads/inspections/${params.inspectionId}/${params.fileName}`,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      (typeof data.error === 'string' && data.error) ||
        `Ravin S3 presign failed (${res.status})`
    );
  }

  const url =
    (typeof data.url === 'string' && data.url) ||
    config.s3IngestUrl ||
    'https://ravin-eye-ingest.s3.amazonaws.com/';

  const fields =
    (data.fields && typeof data.fields === 'object'
      ? (data.fields as Record<string, string>)
      : null) ||
    buildFieldsFromLegacyResponse(data);

  if (!fields.key && !fields.Key) {
    throw new Error('Ravin S3 presign response missing upload fields');
  }

  return { url, fields };
}

function buildFieldsFromLegacyResponse(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of [
    'key',
    'Key',
    'AWSAccessKeyId',
    'acl',
    'policy',
    'signature',
    'x-amz-meta-inspection-id',
    'x-amz-meta-vehicle-id',
  ]) {
    if (typeof data[k] === 'string') out[k] = data[k] as string;
  }
  return out;
}
