import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { verifyAndRemoveOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { phoneNumber, otp, newPassword } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const { valid, userId } = verifyAndRemoveOTP(phoneNumber.trim(), otp);
    
    if (!valid || !userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // If new password is provided, update it
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Update password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    }

    // If no password provided, just verify OTP
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      verified: true,
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

