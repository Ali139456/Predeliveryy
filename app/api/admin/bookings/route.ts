import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { canAccessAdminPanel } from '@/lib/roles';

const ALLOWED_STATUSES = new Set(['new', 'contacted', 'scheduled', 'completed', 'cancelled']);

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!canAccessAdminPanel(user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit') || 100), 500));

  const supabase = getSupabase();
  let query = supabase
    .from('inspection_bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status && ALLOWED_STATUSES.has(status)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('List bookings error:', error);
    return NextResponse.json({ success: false, error: 'Could not load bookings.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, bookings: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!canAccessAdminPanel(user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const id = typeof (body as Record<string, unknown>).id === 'string'
    ? ((body as Record<string, unknown>).id as string).trim()
    : '';
  const status = typeof (body as Record<string, unknown>).status === 'string'
    ? ((body as Record<string, unknown>).status as string).trim()
    : '';

  if (!id || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json(
      { success: false, error: 'Provide booking id and a valid status.' },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('inspection_bookings')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error || !data) {
    console.error('Update booking status error:', error);
    return NextResponse.json({ success: false, error: 'Could not update booking.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking: data });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  // Hard delete is admin-only - managers can mark cancelled but cannot purge.
  if (user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = (url.searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ success: false, error: 'Booking id is required.' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('inspection_bookings').delete().eq('id', id);
  if (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ success: false, error: 'Could not delete booking.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
