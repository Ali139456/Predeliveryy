import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const { allowed } = await enforceRateLimit(request, 'api:auth:logout', { windowSeconds: 60, limit: 30, scope: 'ip+user' });
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const user = await getCurrentUser(request);
  const response = NextResponse.json({ success: true });
  
  // Delete the auth-token cookie with the same settings as when it was set
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  if (user) {
    await logAuditEvent(request, {
      action: 'auth.logout',
      resourceType: 'user',
      resourceId: user.userId,
      details: { email: user.email, role: user.role },
    });
  }
  
  return response;
}

