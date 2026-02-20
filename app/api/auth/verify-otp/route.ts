import { NextRequest, NextResponse } from 'next/server';
import { verifyAndRemoveOTP } from '@/lib/otp';
import { getUserById } from '@/lib/db-users';
import getSupabase from '@/lib/supabase';
import { hashPassword } from '@/lib/db-users';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, newPassword } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    const { valid, userId } = verifyAndRemoveOTP(phoneNumber.trim(), otp);
    if (!valid || !userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      if (!/[A-Z]/.test(newPassword)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one uppercase letter' },
          { status: 400 }
        );
      }
      if (!/[a-z]/.test(newPassword)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one lowercase letter' },
          { status: 400 }
        );
      }
      if (!/[0-9]/.test(newPassword)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one number' },
          { status: 400 }
        );
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one special character' },
          { status: 400 }
        );
      }

      const user = await getUserById(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const hashed = await hashPassword(newPassword);
      const supabase = getSupabase();
      await supabase.from('users').update({ password: hashed, updated_at: new Date().toISOString() }).eq('id', userId);

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      verified: true,
    });
  } catch (error: unknown) {
    console.error('Verify OTP error:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
