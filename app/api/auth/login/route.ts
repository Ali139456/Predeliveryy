import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByPhone, comparePassword } from '@/lib/db-users';
import {
  enforceAdminMfa,
  generateMfaPendingToken,
  generateToken,
} from '@/lib/auth';
import { getUserMfaFields } from '@/lib/db-users';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';
import { notifyUserOfLoginEmail } from '@/lib/email';

const ROLES_LOGIN_EMAIL_ALERT = new Set<string>(['admin', 'technician']);

/** Set true to require MFA setup/verify for admin logins (see lib/auth.enforceAdminMfa). */
const ADMIN_MFA_LOGIN_GATE = false;

function clientIpHint(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'Unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:login', { windowSeconds: 60, limit: 10, scope: 'ip' });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { email, phoneNumber, password } = await request.json();

    if ((!email && !phoneNumber) || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Phone number and password are required' },
        { status: 400 }
      );
    }

    const user = email
      ? await getUserByEmail(email)
      : await getUserByPhone(phoneNumber ?? '');

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'Account is deactivated' }, { status: 403 });
    }

    const isPasswordValid = user.password && (await comparePassword(user.password, password));
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (ADMIN_MFA_LOGIN_GATE && user.role === 'admin') {
      const mfa = await getUserMfaFields(user.id);
      const mustUseMfa = enforceAdminMfa() || Boolean(mfa?.mfaEnabled);

      if (mustUseMfa && !mfa?.mfaEnabled) {
        const setupToken = await generateMfaPendingToken(user.id, 'mfa_setup');
        return NextResponse.json({
          success: true,
          requiresMfaSetup: true,
          setupToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      }

      if (mfa?.mfaEnabled && mfa.mfaSecret) {
        const mfaToken = await generateMfaPendingToken(user.id, 'mfa_pending');
        return NextResponse.json({
          success: true,
          requiresMfa: true,
          mfaToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      }
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: (user as any).tenantId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        tenantId: (user as any).tenantId,
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
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email, role: user.role },
    });

    if (ROLES_LOGIN_EMAIL_ALERT.has(user.role)) {
      void notifyUserOfLoginEmail(user.email, {
        name: user.name || '',
        role: user.role,
        whenUtc: new Date().toISOString(),
        clientIp: clientIpHint(request),
      });
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
