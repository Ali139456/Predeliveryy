import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { userRowToUser } from '@/types/db';
import type { UserRow } from '@/types/db';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(['admin', 'manager'])(request);
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('users')
      .select('id, email, phone_number, name, role, is_active, organization, tenant_id, created_at, updated_at')
      .eq('id', params.id)
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (authUser.role !== 'admin' && row.tenant_id !== authUser.tenantId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const user = userRowToUser({ ...row, password: '' } as UserRow);
    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch user';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['admin'])(request);
    const supabase = getSupabase();
    const { data: existing } = await supabase.from('users').select('*').eq('id', params.id).single();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { email, phoneNumber, password, name, role, isActive, organization, tenantId } =
      await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (tenantId !== undefined && typeof tenantId === 'string' && tenantId !== existing.tenant_id) {
      const { data: tenantRow } = await supabase.from('tenants').select('id').eq('id', tenantId).single();
      if (!tenantRow) {
        return NextResponse.json({ success: false, error: 'Organisation not found' }, { status: 400 });
      }
      const nextEmail = (email && email.toLowerCase()) || existing.email;
      const nextPhone = phoneNumber !== undefined ? String(phoneNumber).trim() : existing.phone_number;
      const { data: emailTaken } = await supabase
        .from('users')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('email', nextEmail)
        .neq('id', params.id)
        .maybeSingle();
      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: 'This email is already used in the selected organisation' },
          { status: 400 }
        );
      }
      const { data: phoneTaken } = await supabase
        .from('users')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('phone_number', nextPhone)
        .neq('id', params.id)
        .maybeSingle();
      if (phoneTaken) {
        return NextResponse.json(
          { success: false, error: 'This phone number is already used in the selected organisation' },
          { status: 400 }
        );
      }
      updates.tenant_id = tenantId;
    }

    if (email && email.toLowerCase() !== existing.email) {
      const { data: conflict } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
      if (conflict) {
        return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
      }
      updates.email = email.toLowerCase();
    }

    if (phoneNumber !== undefined) {
      const trimmed = phoneNumber?.trim() || '';
      if (!trimmed) {
        return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
      }
      if (trimmed !== existing.phone_number) {
        const { data: conflict } = await supabase.from('users').select('id').eq('phone_number', trimmed).single();
        if (conflict) {
          return NextResponse.json({ success: false, error: 'User with this phone number already exists' }, { status: 400 });
        }
        updates.phone_number = trimmed;
      }
    }

    if (name) updates.name = name;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.is_active = isActive;
    if (organization !== undefined) {
      updates.organization =
        typeof organization === 'string' && organization.trim() ? organization.trim() : null;
    }

    if (password) {
      const err = validatePassword(password);
      if (err) return NextResponse.json({ success: false, error: err }, { status: 400 });
      updates.password = await hashPassword(password);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', params.id)
      .select('id, email, phone_number, name, role, is_active, organization, tenant_id')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    await logAuditEvent(request, {
      action: 'user.updated',
      resourceType: 'user',
      resourceId: user.id,
      details: {
        email: user.email,
        phoneNumber: user.phone_number,
        tenantId: user.tenant_id,
        changes: Object.keys({
          email,
          phoneNumber,
          name,
          role,
          isActive,
          organization,
          tenantId,
          password: password ? '***' : undefined,
        }).filter(Boolean),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phone_number,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        organization: user.organization,
        tenantId: user.tenant_id,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update user';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['admin'])(request);
    const supabase = getSupabase();
    const { data: user } = await supabase.from('users').select('id, email, name').eq('id', params.id).single();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await supabase.from('users').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', params.id);

    await logAuditEvent(request, {
      action: 'user.deactivated',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email, name: user.name },
    });

    return NextResponse.json({ success: true, message: 'User deactivated successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete user';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
