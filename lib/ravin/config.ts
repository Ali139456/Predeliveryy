import type { RavinAuthMode, RavinInboundMode, RavinOutboundMode } from '@/types/ravin';

export interface RavinConfig {
  enabled: boolean;
  inboundMode: RavinInboundMode;
  outboundMode: RavinOutboundMode;
  authMode: RavinAuthMode;
  apiBaseUrl: string;
  clientKey: string;
  siteId: string | number;
  provider: string;
  brand: string;
  linkExpiredInHours: number;
  loginExpiredInHours: number;
  webhookSecret?: string;
  s3IngestUrl?: string;
  s3PresignUrl?: string;
  s3ResultsPrefix?: string;
  partnerTokenSecret?: string;
}

function parseInboundMode(raw: string | undefined): RavinInboundMode {
  const v = raw?.trim().toLowerCase();
  if (v === 'otl' || v === 's3' || v === 'disabled') return v;
  return 's3';
}

function parseOutboundMode(raw: string | undefined): RavinOutboundMode {
  const v = raw?.trim().toLowerCase();
  if (v === 'webhook' || v === 's3' || v === 'both') return v;
  return 'webhook';
}

function parseAuthMode(raw: string | undefined): RavinAuthMode {
  return raw?.trim().toLowerCase() === 'apt' ? 'apt' : 'art';
}

export function getRavinConfig(): RavinConfig | null {
  const apiBaseUrl = process.env.RAVIN_API_BASE_URL?.trim().replace(/\/$/, '');
  const clientKey =
    process.env.RAVIN_CLIENT_KEY?.trim() || process.env.RAVIN_API_KEY?.trim() || '';
  const siteIdRaw = process.env.RAVIN_SITE_ID?.trim();
  const provider = process.env.RAVIN_PROVIDER?.trim() || '';

  if (!apiBaseUrl || !clientKey || !siteIdRaw || !provider) {
    return null;
  }

  const siteId = /^\d+$/.test(siteIdRaw) ? Number(siteIdRaw) : siteIdRaw;
  const inboundMode = parseInboundMode(process.env.RAVIN_INBOUND_MODE);

  return {
    enabled: inboundMode !== 'disabled',
    inboundMode,
    outboundMode: parseOutboundMode(process.env.RAVIN_OUTBOUND_MODE),
    authMode: parseAuthMode(process.env.RAVIN_AUTH_MODE),
    apiBaseUrl,
    clientKey,
    siteId,
    provider,
    brand: process.env.RAVIN_BRAND?.trim() || 'Pre Delivery',
    linkExpiredInHours: Number(process.env.RAVIN_LINK_EXPIRED_HOURS || 720),
    loginExpiredInHours: Number(process.env.RAVIN_LOGIN_EXPIRED_HOURS || 72),
    webhookSecret: process.env.RAVIN_WEBHOOK_SECRET?.trim(),
    s3IngestUrl: process.env.RAVIN_S3_INGEST_URL?.trim(),
    s3PresignUrl: process.env.RAVIN_S3_PRESIGN_URL?.trim(),
    s3ResultsPrefix: process.env.RAVIN_S3_RESULTS_PREFIX?.trim() || 'ravin-results/',
    partnerTokenSecret: process.env.RAVIN_PARTNER_TOKEN_SECRET?.trim(),
  };
}

export function isRavinIntegrationEnabled(): boolean {
  const cfg = getRavinConfig();
  return !!cfg?.enabled;
}

export function ravinPublicConfig() {
  const cfg = getRavinConfig();
  if (!cfg) {
    return { enabled: false as const };
  }
  return {
    enabled: true as const,
    inboundMode: cfg.inboundMode,
    outboundMode: cfg.outboundMode,
    authMode: cfg.authMode,
    brand: cfg.brand,
  };
}
