import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
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
