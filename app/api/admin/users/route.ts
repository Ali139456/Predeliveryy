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

type TenantEmbed = { id?: string; name?: string; business_name?: string | null } | null;

function mapUserListRow(r: Record<string, unknown>) {
  const t = r.tenants as TenantEmbed;
  const row = {
    id: r.id as string,
    tenant_id: r.tenant_id as string,
    email: r.email as string,
    phone_number: r.phone_number as string,
    password: '',
    name: r.name as string,
    role: r.role as UserRow['role'],
    is_active: r.is_active as boolean,
    organization: (r.organization as string | null) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  };
  const base = userRowToUser(row);
  const business = (t?.business_name as string) || '';
  const tenantName = (t?.name as string) || '';
  const customOrg = typeof r.organization === 'string' ? r.organization.trim() : '';
  const organizationDisplay = customOrg || business || tenantName || '—';
  return {
    ...base,
    tenantBusinessName: business || null,
    tenantName: tenantName || null,
    organizationDisplay,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(['admin', 'manager'])(request);
    const supabase = getSupabase();

    let q = supabase
      .from('users')
      .select(
        'id, email, phone_number, name, role, is_active, organization, tenant_id, created_at, updated_at, tenants ( id, name, business_name )'
      )
      .order('created_at', { ascending: false });

    if (authUser.role !== 'admin') {
      q = q.eq('tenant_id', authUser.tenantId);
    }

    const { data: rows, error } = await q;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const users = (rows || []).map((r) => mapUserListRow(r as Record<string, unknown>));

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
    const authUser = await requireAuth(['admin'])(request);
    const body = await request.json();
    const { email, phoneNumber, password, name, role, isActive, tenantId, organization } = body;

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

    let targetTenantId = authUser.tenantId;
    if (tenantId && typeof tenantId === 'string') {
      const supabaseCheck = getSupabase();
      const { data: tenantRow } = await supabaseCheck.from('tenants').select('id').eq('id', tenantId).single();
      if (!tenantRow) {
        return NextResponse.json({ success: false, error: 'Organisation not found' }, { status: 400 });
      }
      targetTenantId = tenantId;
    }

    const orgLabel =
      typeof organization === 'string' && organization.trim() ? organization.trim() : null;

    const supabase = getSupabase();
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', targetTenantId)
      .eq('email', email.toLowerCase())
      .single();
    if (existingEmail) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', targetTenantId)
      .eq('phone_number', phoneNumber.trim())
      .single();
    if (existingPhone) {
      return NextResponse.json({ success: false, error: 'User with this phone number already exists' }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        tenant_id: targetTenantId,
        email: email.toLowerCase(),
        phone_number: phoneNumber.trim(),
        password: hashed,
        name,
        role: role || 'technician',
        is_active: isActive !== undefined ? isActive : true,
        organization: orgLabel,
      })
      .select('id, email, phone_number, name, role, is_active, organization')
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
      details: { email: user.email, name: user.name, role: user.role, tenantId: targetTenantId },
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
        organization: user.organization,
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
