import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import { generateOTP, storeOTP } from '@/lib/otp';

// Send OTP via SMS (mock function - replace with actual SMS service like Twilio)
async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`OTP for ${phoneNumber}: ${otp}`);
  // For now, we'll just log it. In production, integrate with SMS service
  // Example: await twilioClient.messages.create({ to: phoneNumber, body: `Your OTP is: ${otp}` });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, phoneNumber } = await request.json();

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber: phoneNumber.trim() });
    }
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, reset instructions have been sent.',
      });
    }

    try {
      if (phoneNumber) {
        // Generate and send OTP via SMS
        const otp = generateOTP();
        
        // Store OTP
        storeOTP(phoneNumber.trim(), otp, user._id.toString(), 10);

        // Send OTP via SMS
        await sendOTP(phoneNumber.trim(), otp);

        return NextResponse.json({
          success: true,
          message: 'OTP has been sent to your phone number.',
          requiresOTP: true,
        });
      } else if (email) {
        // Send reset email
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
        
        await sendEmail(
          [user.email],
          'Password Reset Request - Pre delivery inspection',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Password Reset Request</h2>
              <p>Hello ${user.name || 'User'},</p>
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
    } catch (error: any) {
      console.error('Send error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to send reset instructions. Please contact your administrator.',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process reset request' },
      { status: 500 }
    );
  }
}

