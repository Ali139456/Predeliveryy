import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { userRowToUser } from '@/types/db';
import type { UserRow } from '@/types/db';
import { hashPassword } from '@/lib/db-users';
import { sendNewUserCredentials } from '@/lib/email';

const PASSWORD_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!PASSWORD_REGEX.test(password)) return 'Password must contain at least one special character';
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin', 'manager'])(request);
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, email, phone_number, name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const users = (rows || []).map((r) => {
      const row = { ...r, password: '' } as UserRow;
      return userRowToUser(row);
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch users';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: msg },
        { status: msg === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(['admin'])(request);
    const { email, phoneNumber, password, name, role, isActive } = await request.json();

    if (!email || !password || !name || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Email, phone number, password, and name are required' },
        { status: 400 }
      );
    }
    if (!phoneNumber.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const err = validatePassword(password);
    if (err) return NextResponse.json({ success: false, error: err }, { status: 400 });

    const supabase = getSupabase();
    const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existingEmail) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }
    const { data: existingPhone } = await supabase.from('users').select('id').eq('phone_number', phoneNumber.trim()).single();
    if (existingPhone) {
      return NextResponse.json({ success: false, error: 'User with this phone number already exists' }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        phone_number: phoneNumber.trim(),
        password: hashed,
        name,
        role: role || 'technician',
        is_active: isActive !== undefined ? isActive : true,
      })
      .select('id, email, phone_number, name, role, is_active')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
    }

    await logAuditEvent(request, {
      action: 'user.created',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email, name: user.name, role: user.role },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const loginUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/login` : '';

    let emailSent = false;
    let emailError: string | null = null;
    if (loginUrl) {
      try {
        await sendNewUserCredentials(user.email, user.name, password, loginUrl);
        emailSent = true;
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Failed to send welcome email';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phone_number,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        emailSent,
        emailError: emailError ?? undefined,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create user';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
