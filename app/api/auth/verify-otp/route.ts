import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAndRemoveOTP } from '@/lib/otp';
import { getUserById } from '@/lib/db-users';
import getSupabase from '@/lib/supabase';
import { hashPassword } from '@/lib/db-users';
import { enforceRateLimit } from '@/lib/rateLimit';

const verifyBodySchema = z.object({
  phoneNumber: z.string().trim().min(5).max(32),
  otp: z.string().regex(/^\d{4,8}$/),
  newPassword: z.string().min(8).max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:verify-otp', {
      windowSeconds: 60,
      limit: 20,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const raw = await request.json();
    const parsed = verifyBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or OTP format' },
        { status: 400 }
      );
    }
    const { phoneNumber, otp, newPassword } = parsed.data;

    const { valid, userId } = verifyAndRemoveOTP(phoneNumber, otp);
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
