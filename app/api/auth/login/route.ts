import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByPhone, comparePassword } from '@/lib/db-users';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber, password } = await request.json();

    if ((!email && !phoneNumber) || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Phone number and password are required' },
        { status: 400 }
      );
    }

    const user = email
      ? await getUserByEmail(email)
      : await getUserByPhone(phoneNumber ?? '');

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'Account is deactivated' }, { status: 403 });
    }

    const isPasswordValid = user.password && (await comparePassword(user.password, password));
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
