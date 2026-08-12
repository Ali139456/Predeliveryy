import { NextRequest, NextResponse } from 'next/server';
import { getRavinConfig } from '@/lib/ravin/config';
import { validatePartnerToken } from '@/lib/ravin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Flow 1 (APT): Ravin validates partner token before issuing OTL. */
export async function POST(request: NextRequest) {
  try {
    const config = getRavinConfig();
    if (!config || config.authMode !== 'apt') {
      return NextResponse.json({ message: 'Partner validation not enabled' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token : '';
    const invitationId =
      typeof body.invitationId === 'string' ? body.invitationId : undefined;

    if (!validatePartnerToken(config, token, invitationId)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Dummy response success' });
  } catch {
    return NextResponse.json({ message: 'Validation error' }, { status: 500 });
  }
}
