import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import getSupabase from '@/lib/supabase';
import { getUserById, hashPassword } from '@/lib/db-users';
import { verifyPasswordResetToken } from '@/lib/password-reset-token';
import { enforceRateLimit } from '@/lib/rateLimit';

const bodySchema = z.object({
  token: z.string().min(10).max(2000),
  newPassword: z.string().min(8).max(200),
});

function validatePasswordStrength(password: string): string | null {
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:complete-password-reset', {
      windowSeconds: 60,
      limit: 10,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const { token, newPassword } = parsed.data;
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return NextResponse.json({ success: false, error: strengthError }, { status: 400 });
    }

    const claims = verifyPasswordResetToken(token);
    if (!claims) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }

    const user = await getUserById(claims.userId);
    if (!user || user.email.toLowerCase() !== claims.email) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'Account is deactivated' }, { status: 403 });
    }

    const hashed = await hashPassword(newPassword);
    const supabase = getSupabase();
    const { error } = await supabase
      .from('users')
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('complete-password-reset update error:', error);
      return NextResponse.json({ success: false, error: 'Could not update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password has been reset. You can sign in now.' });
  } catch (e: unknown) {
    console.error('complete-password-reset:', e);
    const message = e instanceof Error ? e.message : 'Failed to reset password';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
