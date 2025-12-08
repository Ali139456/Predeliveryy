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
    
    const { email, password, name, role, isActive } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

      const user = await User.create({
        email: email.toLowerCase(),
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

