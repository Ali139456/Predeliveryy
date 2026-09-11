import { NextResponse } from 'next/server';
import { getRavinConfig } from '@/lib/ravin/config';
import { getRavinSignInToken } from '@/lib/ravin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Verify Ravin credentials (ART sign-in token). Does not expose secrets. */
export async function GET() {
  const config = getRavinConfig();
  if (!config) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        auth: 'missing_config',
        message: 'Set RAVIN_API_BASE_URL, RAVIN_CLIENT_KEY, RAVIN_SITE_ID, and RAVIN_PROVIDER.',
      },
      { status: 503 }
    );
  }

  try {
    await getRavinSignInToken(config);
    return NextResponse.json({
      success: true,
      configured: true,
      auth: 'ok',
      inboundMode: config.inboundMode,
      outboundMode: config.outboundMode,
      authMode: config.authMode,
      apiBaseUrl: config.apiBaseUrl,
      siteId: config.siteId,
      provider: config.provider,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://www.predelivery.ai'}/api/webhooks/ravin`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ravin auth failed';
    return NextResponse.json(
      {
        success: false,
        configured: true,
        auth: 'failed',
        message,
        inboundMode: config.inboundMode,
        outboundMode: config.outboundMode,
        authMode: config.authMode,
      },
      { status: 502 }
    );
  }
}
