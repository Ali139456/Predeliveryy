import { NextRequest, NextResponse } from 'next/server';
import { getRavinConfig } from '@/lib/ravin/config';
import { parseRavinReportPayload } from '@/lib/ravin/parse-report';
import { applyRavinReportToInspection } from '@/lib/ravin/apply-report';
import {
  findInspectionByInvitationId,
  saveInspectionAfterRavinReport,
} from '@/lib/ravin/inspection-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyWebhookSecret(request: NextRequest, secret: string | undefined): boolean {
  if (!secret) return process.env.NODE_ENV !== 'production';
  const header =
    request.headers.get('x-ravin-webhook-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return header === secret;
}

/** Browser / Ravin health check — confirms route is deployed (POST is used for real payloads). */
export async function GET() {
  const config = getRavinConfig();
  return NextResponse.json({
    success: true,
    service: 'ravin-webhook',
    configured: !!config,
    outboundMode: config?.outboundMode ?? null,
    message: config
      ? 'Webhook endpoint active. Ravin should POST JSON payloads here.'
      : 'Route deployed. Set RAVIN_* env vars to enable processing.',
  });
}

/** Receive Ravin JSON + PDF notification (Phase 4 — webhook delivery). */
export async function POST(request: NextRequest) {
  try {
    const config = getRavinConfig();
    if (!config) {
      return NextResponse.json({ success: false, error: 'Ravin not configured' }, { status: 503 });
    }

    if (config.outboundMode === 's3') {
      return NextResponse.json(
        { success: false, error: 'Webhook delivery disabled (RAVIN_OUTBOUND_MODE=s3)' },
        { status: 503 }
      );
    }

    if (!verifyWebhookSecret(request, config.webhookSecret)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const report = parseRavinReportPayload(body);
    const invitationId = report.invitationId;
    if (!invitationId) {
      return NextResponse.json(
        { success: false, error: 'Missing invitationId in Ravin payload' },
        { status: 400 }
      );
    }

    const inspection = await findInspectionByInvitationId(invitationId);
    if (!inspection) {
      console.warn('[webhooks/ravin] No inspection for invitationId:', invitationId);
      return NextResponse.json({ success: true, matched: false });
    }

    const { inspection: updated, ravin } = applyRavinReportToInspection(inspection, report);
    ravin.status = 'completed';
    ravin.inboundMode = inspection.ravinIntegration?.inboundMode || config.inboundMode;
    ravin.invitationId = invitationId;

    await saveInspectionAfterRavinReport(updated, ravin);

    return NextResponse.json({
      success: true,
      matched: true,
      inspectionId: inspection.id,
      damageCount: report.findings.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('[webhooks/ravin]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
