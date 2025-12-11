import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current user
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { email, phoneNumber, password, name } = await request.json();
    const user = await User.findById(currentUser.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate phone number is provided
    if (phoneNumber !== undefined) {
      const trimmedPhone = phoneNumber?.trim() || '';
      if (!trimmedPhone) {
        return NextResponse.json(
          { success: false, error: 'Phone number is required' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== user.email) {
      const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserByEmail) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 400 }
        );
      }
      user.email = email.toLowerCase();
    }

    // Check if phone number is being changed and if it already exists
    if (phoneNumber !== undefined && phoneNumber.trim() !== user.phoneNumber) {
      const trimmedPhone = phoneNumber.trim();
      const existingUserByPhone = await User.findOne({ phoneNumber: trimmedPhone });
      if (existingUserByPhone) {
        return NextResponse.json(
          { success: false, error: 'User with this phone number already exists' },
          { status: 400 }
        );
      }
      user.phoneNumber = trimmedPhone;
    }

    if (name) user.name = name;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      if (!/[A-Z]/.test(password)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one uppercase letter' },
          { status: 400 }
        );
      }

      if (!/[a-z]/.test(password)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one lowercase letter' },
          { status: 400 }
        );
      }

      if (!/[0-9]/.test(password)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one number' },
          { status: 400 }
        );
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return NextResponse.json(
          { success: false, error: 'Password must contain at least one special character' },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

