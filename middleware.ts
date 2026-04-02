import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Block unauthenticated access to tenant data routes. APIs already enforce JWT + tenant_id;
 * this prevents casual browsing of /inspections/:id or /admin without a session (no "public link" UX).
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value?.trim();
  const looksLikeJwt = !!token && token.split('.').length === 3 && token.length > 30;

  if (!looksLikeJwt) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const dest = request.nextUrl.pathname + request.nextUrl.search;
    if (dest && dest !== '/login') {
      url.searchParams.set('redirect', dest);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/inspections/:path*', '/inspection/:path*', '/admin', '/admin/:path*'],
};
