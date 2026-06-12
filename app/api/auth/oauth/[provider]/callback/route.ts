import { NextRequest, NextResponse } from 'next/server';
import {
  enforceAdminMfa,
  generateMfaPendingToken,
  generateToken,
} from '@/lib/auth';
import { getUserByEmail, getUserMfaFields } from '@/lib/db-users';
import { getClientIP, logAuditEvent, logAuditEventWithUser } from '@/lib/audit';
import { hashForAudit, isOAuthProvider, profileFromOAuthCode } from '@/lib/oauth';

function loginRedirect(request: NextRequest, query: Record<string, string>) {
  const url = new URL('/login', request.nextUrl.origin);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

/** Set true to require MFA setup/verify for admin OAuth logins (see lib/auth.enforceAdminMfa). */
const ADMIN_MFA_LOGIN_GATE = false;

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  if (!isOAuthProvider(params.provider)) {
    return loginRedirect(request, { error: 'Unknown OAuth provider' });
  }

  const { searchParams } = new URL(request.url);
  const errorParam = searchParams.get('error');
  if (errorParam) {
    return loginRedirect(request, { error: errorParam });
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const cookieState = request.cookies.get('oauth_state')?.value;
  const cookieProvider = request.cookies.get('oauth_provider')?.value;

  if (!code || !state || !cookieState || state !== cookieState || cookieProvider !== params.provider) {
    return loginRedirect(request, { error: 'Invalid OAuth state. Please try again.' });
  }

  const oauthOrigin =
    request.cookies.get('oauth_origin')?.value || request.nextUrl.origin;

  try {
    const profile = await profileFromOAuthCode(params.provider, code, oauthOrigin);
    const user = await getUserByEmail(profile.email);

    if (!user || !user.isActive) {
      await logAuditEvent(request, {
        action: 'auth.oauth_failed',
        resourceType: 'user',
        details: {
          provider: params.provider,
          emailHash: hashForAudit(profile.email),
          reason: 'no_account',
        },
      });
      return loginRedirect(request, {
        error: 'No active account for this email. Ask your administrator to invite you.',
      });
    }

    if (ADMIN_MFA_LOGIN_GATE && user.role === 'admin') {
      const mfa = await getUserMfaFields(user.id);
      const mustUseMfa = enforceAdminMfa() || Boolean(mfa?.mfaEnabled);

      if (mustUseMfa && !mfa?.mfaEnabled) {
        const setupToken = await generateMfaPendingToken(user.id, 'mfa_setup');
        const res = loginRedirect(request, { requiresMfaSetup: '1', setupToken });
        res.cookies.delete('oauth_state');
        res.cookies.delete('oauth_provider');
        return res;
      }

      if (mfa?.mfaEnabled && mfa.mfaSecret) {
        const mfaToken = await generateMfaPendingToken(user.id, 'mfa_pending');
        const res = loginRedirect(request, { requiresMfa: '1', mfaToken });
        res.cookies.delete('oauth_state');
        res.cookies.delete('oauth_provider');
        return res;
      }
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const destination =
      user.role === 'admin' || user.role === 'manager'
        ? '/admin'
        : user.role === 'viewer'
          ? '/inspections'
          : '/';

    const response = NextResponse.redirect(new URL(destination, request.nextUrl.origin));
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_provider');
    response.cookies.delete('oauth_origin');

    await logAuditEventWithUser(
      user.tenantId,
      user.id,
      user.email,
      user.name || user.email,
      {
        action: 'auth.oauth_login',
        resourceType: 'user',
        resourceId: user.id,
        details: { provider: params.provider, role: user.role },
      },
      getClientIP(request),
      request.headers.get('user-agent') || 'unknown'
    );

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'OAuth login failed';
    return loginRedirect(request, { error: message });
  }
}
