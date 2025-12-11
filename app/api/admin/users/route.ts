import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin', 'manager'])(request);
    await connectDB();

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(['admin'])(request);
    await connectDB();
    
    const { email, phoneNumber, password, name, role, isActive } = await request.json();

    if (!email || !password || !name || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Email, phone number, password, and name are required' },
        { status: 400 }
      );
    }

    if (!phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

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

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingUserByPhone = await User.findOne({ phoneNumber: phoneNumber.trim() });
    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, error: 'User with this phone number already exists' },
        { status: 400 }
      );
    }

      const user = await User.create({
        email: email.toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password,
        name,
        role: role || 'technician',
        isActive: isActive !== undefined ? isActive : true,
      });

      // Log audit event
      await logAuditEvent(request, {
        action: 'user.created',
        resourceType: 'user',
        resourceId: user._id.toString(),
        details: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

