import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByPhone } from '@/lib/db-users';
import { sendEmail } from '@/lib/email';
import { signPasswordResetToken } from '@/lib/password-reset-token';
import { generateOTP, storeOTP } from '@/lib/otp';
import { enforceRateLimit } from '@/lib/rateLimit';
import { escapeHtml } from '@/lib/security';

async function sendOTPSms(_phoneNumber: string, _otp: string): Promise<void> {
  // TODO: Integrate real SMS provider (Twilio, etc.). Do not log OTP.
}

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:auth:reset-password', {
      windowSeconds: 60,
      limit: 8,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { email, phoneNumber } = await request.json();

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    const user = email
      ? await getUserByEmail(email)
      : await getUserByPhone(phoneNumber ?? '');

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, reset instructions have been sent.',
      });
    }

    try {
      if (phoneNumber) {
        const otp = generateOTP();
        storeOTP(phoneNumber.trim(), otp, user.id, 10);
        await sendOTPSms(phoneNumber.trim(), otp);
        return NextResponse.json({
          success: true,
          message: 'OTP has been sent to your phone number.',
          requiresOTP: true,
        });
      }

      if (email) {
        const resetToken = signPasswordResetToken(user.id, user.email);
        const baseUrl =
          process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
          process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
          'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

        const safeName = escapeHtml(user.name || 'User');

        await sendEmail(
          [user.email],
          'Password Reset Request - Pre delivery inspection',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Password Reset Request</h2>
              <p>Hello ${safeName},</p>
              <p>You requested to reset your password for your Pre delivery inspection account.</p>
              <p>Please contact your administrator to reset your password, or use the following link:</p>
              <p style="margin: 20px 0;">
                <a href="${resetLink}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p style="color: #666; font-size: 12px;">
                If you didn't request this, please ignore this email. This link will expire in 1 hour.
              </p>
              <p style="color: #666; font-size: 12px;">
                For security reasons, please contact your administrator if you need assistance.
              </p>
            </div>
          `
        );

        return NextResponse.json({
          success: true,
          message: 'Password reset instructions have been sent to your email.',
        });
      }
    } catch (err: unknown) {
      console.error('Send error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to send reset instructions.';
      return NextResponse.json(
        {
          success: false,
          error: msg.includes('Resend') || msg.includes('onboarding') || msg.includes('RESEND') || msg.includes('verified')
            ? msg
            : 'Failed to send reset instructions. Please contact your administrator.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process reset request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
