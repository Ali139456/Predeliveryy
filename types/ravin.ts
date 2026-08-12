import type { VisionDamageFinding } from '@/types/vision-damage';

export type RavinInboundMode = 'otl' | 's3' | 'disabled';
export type RavinOutboundMode = 'webhook' | 's3' | 'both';
export type RavinAuthMode = 'art' | 'apt';

export type RavinIntegrationStatus =
  | 'idle'
  | 'otl_created'
  | 'submitted'
  | 'processing'
  | 'completed'
  | 'failed';

/** Persisted on inspections.ravin_integration (JSONB). */
export interface RavinIntegrationState {
  status: RavinIntegrationStatus;
  inboundMode?: RavinInboundMode;
  invitationId?: string;
  otlUrl?: string;
  otlExpiresAt?: string;
  traceId?: string;
  submittedAt?: string;
  completedAt?: string;
  uploadedPhotoCount?: number;
  error?: string;
  reportPdfUrl?: string;
  summary?: string;
  damageCount?: number;
  findings?: VisionDamageFinding[];
  totalRepairEstimate?: string;
  /** Last webhook / S3 payload (trimmed for storage). */
  rawPayload?: unknown;
}

export interface RavinPartnerInviteResponse {
  timestamp?: string;
  traceId?: string;
  message?: string;
  expirationTimestamp?: string;
  error?: string;
}

export interface RavinSignInTokenResponse {
  token?: string;
  expiresIn?: number | string;
  timestamp?: string;
  traceId?: string;
  error?: string;
}

export interface RavinPresignedPostFields {
  url: string;
  fields: Record<string, string>;
}

export interface RavinParsedReport {
  invitationId?: string;
  summary?: string;
  reportPdfUrl?: string;
  findings: VisionDamageFinding[];
  totalRepairEstimate?: string;
  rawElements: unknown[];
}
