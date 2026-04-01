import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import getSupabase from '@/lib/supabase';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

function slugBase(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return s || 'organisation';
}

function mapTenantRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    businessName: (row.business_name as string) || '',
    abn: (row.abn as string) || '',
    businessAddress: (row.business_address as string) || '',
    contactName: (row.contact_name as string) || '',
    contactEmail: (row.contact_email as string) || '',
    contactNumber: (row.contact_number as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function GET(request: NextRequest) {
  await enforceRateLimit(request, 'admin.tenants.get', { limit: 60, windowSeconds: 60, scope: 'ip+user' });
  await requireAuth(['admin'])(request);
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, business_name, abn, business_address, contact_name, contact_email, contact_number, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: (data || []).map((row) => mapTenantRow(row as Record<string, unknown>)),
  });
}

export async function POST(request: NextRequest) {
  await enforceRateLimit(request, 'admin.tenants.post', { limit: 30, windowSeconds: 60, scope: 'ip+user' });
  await requireAuth(['admin'])(request);
  const supabase = getSupabase();

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
  if (!businessName) {
    return NextResponse.json({ success: false, error: 'Business name is required' }, { status: 400 });
  }

  const abn = typeof body.abn === 'string' ? body.abn.trim() : '';
  const businessAddress = typeof body.businessAddress === 'string' ? body.businessAddress.trim() : '';
  const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : '';
  const contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail.trim() : '';
  const contactNumber = typeof body.contactNumber === 'string' ? body.contactNumber.trim() : '';

  let uniqueName = `${slugBase(businessName)}-${Math.random().toString(36).slice(2, 10)}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: created, error } = await supabase
      .from('tenants')
      .insert({
        name: uniqueName,
        business_name: businessName,
        abn: abn || null,
        business_address: businessAddress || null,
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        contact_number: contactNumber || null,
      })
      .select('id, name, business_name, abn, business_address, contact_name, contact_email, contact_number, created_at, updated_at')
      .single();

    if (!error && created) {
      await logAuditEvent(request, {
        action: 'tenant.created',
        resourceType: 'tenant',
        resourceId: created.id,
        details: { name: created.name, businessName: created.business_name },
      });
      return NextResponse.json({
        success: true,
        data: mapTenantRow(created as Record<string, unknown>),
      });
    }

    if (error?.message?.includes('unique') || error?.code === '23505') {
      uniqueName = `${slugBase(businessName)}-${Math.random().toString(36).slice(2, 12)}`;
      continue;
    }

    return NextResponse.json({ success: false, error: error?.message || 'Failed to create organisation' }, { status: 500 });
  }

  return NextResponse.json({ success: false, error: 'Could not generate a unique organisation key' }, { status: 500 });
}
