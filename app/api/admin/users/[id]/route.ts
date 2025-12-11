import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['admin', 'manager'])(request);
    await connectDB();

    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['admin'])(request);
    await connectDB();

    const { email, phoneNumber, password, name, role, isActive } = await request.json();
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
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
    if (phoneNumber !== undefined) {
      const trimmedPhone = phoneNumber?.trim() || '';
      if (!trimmedPhone) {
        return NextResponse.json(
          { success: false, error: 'Phone number is required' },
          { status: 400 }
        );
      }
      if (trimmedPhone !== user.phoneNumber) {
        const existingUserByPhone = await User.findOne({ phoneNumber: trimmedPhone });
        if (existingUserByPhone) {
          return NextResponse.json(
            { success: false, error: 'User with this phone number already exists' },
            { status: 400 }
          );
        }
      }
      user.phoneNumber = trimmedPhone;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    if (password) {
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

    // Log audit event
    await logAuditEvent(request, {
      action: 'user.updated',
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        changes: Object.keys({ email, phoneNumber, name, role, isActive, password: password ? '***' : undefined }).filter(k => k),
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
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['admin'])(request);
    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete - deactivate instead of deleting
    user.isActive = false;
    await user.save();

    // Log audit event
    await logAuditEvent(request, {
      action: 'user.deactivated',
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: {
        email: user.email,
        name: user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

