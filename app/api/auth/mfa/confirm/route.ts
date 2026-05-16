import { NextRequest, NextResponse } from 'next/server';
import {
  enforceAdminMfa,
  generateMfaPendingToken,
  generateToken,
  getCurrentUser,
  verifyMfaPendingToken,
} from '@/lib/auth';
import { enableUserMfa, getUserById, getUserMfaFields } from '@/lib/db-users';
import { verifyMfaCode } from '@/lib/mfa';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

/** Verify first TOTP code and enable MFA (optionally complete login). */
export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:mfa:confirm', {
      windowSeconds: 60,
      limit: 10,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { code, setupToken } = await request.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Verification code required' }, { status: 400 });
    }

    let userId: string | null = null;
    let completeLogin = false;

    if (setupToken) {
      const pending = await verifyMfaPendingToken(setupToken, 'mfa_setup');
      if (!pending) {
        return NextResponse.json({ success: false, error: 'Setup session expired. Sign in again.' }, { status: 401 });
      }
      userId = pending.userId;
      completeLogin = true;
    } else {
      const jwtUser = await getCurrentUser(request);
      if (!jwtUser || jwtUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      userId = jwtUser.userId;
    }

    const mfa = await getUserMfaFields(userId);
    if (!mfa?.mfaSecret) {
      return NextResponse.json({ success: false, error: 'Start MFA setup first' }, { status: 400 });
    }

    if (!verifyMfaCode(mfa.mfaSecret, code)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 401 });
    }

    const enabled = await enableUserMfa(userId);
    if (!enabled) {
      return NextResponse.json({ success: false, error: 'Failed to enable MFA' }, { status: 500 });
    }

    await logAuditEvent(request, {
      action: 'auth.mfa_enabled',
      resourceType: 'user',
      resourceId: userId,
      details: {},
    });

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: true, mfaEnabled: true });
    }

    const responseBody: Record<string, unknown> = {
      success: true,
      mfaEnabled: true,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };

    const response = NextResponse.json(responseBody);

    if (completeLogin || (!setupToken && enforceAdminMfa())) {
      const token = await generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'MFA confirm failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
