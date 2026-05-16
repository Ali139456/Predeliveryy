import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyMfaPendingToken } from '@/lib/auth';
import { getUserById, setUserMfaSecret } from '@/lib/db-users';
import { generateMfaSecret, getMfaOtpAuthUrl } from '@/lib/mfa';
import { enforceRateLimit } from '@/lib/rateLimit';

/** Start or refresh TOTP setup (returns secret + otpauth URL; not enabled until confirm). */
export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:mfa:setup', {
      windowSeconds: 60,
      limit: 10,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const setupToken = typeof body.setupToken === 'string' ? body.setupToken : null;

    let userId: string | null = null;
    if (setupToken) {
      const pending = await verifyMfaPendingToken(setupToken, 'mfa_setup');
      if (!pending) {
        return NextResponse.json({ success: false, error: 'Setup session expired. Sign in again.' }, { status: 401 });
      }
      userId = pending.userId;
    } else {
      const jwtUser = await getCurrentUser(request);
      if (!jwtUser || jwtUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      userId = jwtUser.userId;
    }

    const user = await getUserById(userId);
    if (!user || !user.isActive || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const secret = generateMfaSecret();
    const saved = await setUserMfaSecret(user.id, secret);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to save MFA secret' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      secret,
      otpauthUrl: getMfaOtpAuthUrl(user.email, secret),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'MFA setup failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
