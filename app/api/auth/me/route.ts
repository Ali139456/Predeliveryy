import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:me', {
      windowSeconds: 60,
      limit: 150,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const user = await getCurrentUser(request);
    if (!user) {
      // Return 200 so "not logged in" doesn't show as error in console/network (expected for guests)
      return NextResponse.json({ success: false, error: 'Not authenticated' });
    }

    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      // Return 200 + success: false so clients get JSON and can handle (e.g. redirect to login). 404 would show as "Failed to load resource" and break callers.
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        tenantId: (userDoc as any).tenantId,
        email: userDoc.email,
        phoneNumber: userDoc.phoneNumber,
        name: userDoc.name,
        role: userDoc.role,
        isActive: userDoc.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
