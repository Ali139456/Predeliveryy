import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import getSupabase from '@/lib/supabase';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  await enforceRateLimit(request, 'admin.tenant.get', { limit: 60, windowSeconds: 60, scope: 'user+ip' });
  const user = await requireAuth();
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.tenantId)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request) {
  await enforceRateLimit(request, 'admin.tenant.put', { limit: 30, windowSeconds: 60, scope: 'user+ip' });
  const user = await requireAuth();
  const supabase = getSupabase();

  const body = (await request.json().catch(() => null)) as any;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  const update = {
    business_name: typeof body.businessName === 'string' ? body.businessName : undefined,
    abn: typeof body.abn === 'string' ? body.abn : undefined,
    business_address: typeof body.businessAddress === 'string' ? body.businessAddress : undefined,
    contact_name: typeof body.contactName === 'string' ? body.contactName : undefined,
    contact_email: typeof body.contactEmail === 'string' ? body.contactEmail : undefined,
    contact_number: typeof body.contactNumber === 'string' ? body.contactNumber : undefined,
  };

  const { data, error } = await supabase
    .from('tenants')
    .update(update)
    .eq('id', user.tenantId)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

