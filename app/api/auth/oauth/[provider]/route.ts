import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizeUrl, createOAuthState, isOAuthProvider } from '@/lib/oauth';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 600,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { provider: string } }
) {
  if (!isOAuthProvider(params.provider)) {
    return NextResponse.json({ success: false, error: 'Unknown provider' }, { status: 404 });
  }

  try {
    const state = createOAuthState();
    const url = buildAuthorizeUrl(params.provider, state);
    const response = NextResponse.redirect(url);
    response.cookies.set('oauth_state', state, COOKIE_OPTS);
    response.cookies.set('oauth_provider', params.provider, COOKIE_OPTS);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'OAuth not configured';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, _request.nextUrl.origin)
    );
  }
}
