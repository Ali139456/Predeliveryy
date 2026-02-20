import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { hashPassword } from '@/lib/db-users';

const PASSWORD_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!PASSWORD_REGEX.test(password)) return 'Password must contain at least one special character';
  return null;
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { email, phoneNumber, password, name } = await request.json();
    const user = await getUserById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (phoneNumber !== undefined) {
      const trimmed = phoneNumber?.trim() || '';
      if (!trimmed) {
        return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
      }
    }

    const supabase = getSupabase();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (email && email.toLowerCase() !== user.email) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 400 }
        );
      }
      updates.email = email.toLowerCase();
    }

    if (phoneNumber !== undefined && phoneNumber.trim() !== user.phoneNumber) {
      const trimmed = phoneNumber.trim();
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', trimmed)
        .single();
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'User with this phone number already exists' },
          { status: 400 }
        );
      }
      updates.phone_number = trimmed;
    }

    if (name) updates.name = name;

    if (password && password.trim() !== '') {
      const err = validatePassword(password);
      if (err) return NextResponse.json({ success: false, error: err }, { status: 400 });
      updates.password = await hashPassword(password);
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', currentUser.userId)
      .select('id, email, phone_number, name, role')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        phoneNumber: updated.phone_number,
        name: updated.name,
        role: updated.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
