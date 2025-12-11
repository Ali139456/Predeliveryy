import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.',
      });
    }

    // Generate a simple reset token (in production, use a more secure token)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Store reset token (you might want to add these fields to User model)
    // For now, we'll just send an email with instructions
    // In a full implementation, you'd store the token in the database

    try {
      // Send reset email
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
    } catch (emailError: any) {
      console.error('Email send error:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send reset email. Please contact your administrator.',
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

