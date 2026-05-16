import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyMfaPendingToken } from '@/lib/auth';
import { getUserById, getUserMfaFields } from '@/lib/db-users';
import { verifyMfaCode } from '@/lib/mfa';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:mfa:verify', {
      windowSeconds: 60,
      limit: 15,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { mfaToken, code } = await request.json();
    if (!mfaToken || !code) {
      return NextResponse.json({ success: false, error: 'Verification code required' }, { status: 400 });
    }

    const pending = await verifyMfaPendingToken(mfaToken, 'mfa_pending');
    if (!pending) {
      return NextResponse.json({ success: false, error: 'Session expired. Please sign in again.' }, { status: 401 });
    }

    const user = await getUserById(pending.userId);
    if (!user || !user.isActive || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const mfa = await getUserMfaFields(user.id);
    if (!mfa?.mfaEnabled || !mfa.mfaSecret) {
      return NextResponse.json({ success: false, error: 'MFA is not configured for this account' }, { status: 400 });
    }

    if (!verifyMfaCode(mfa.mfaSecret, code)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 401 });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    await logAuditEvent(request, {
      action: 'auth.mfa_verified',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'MFA verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
