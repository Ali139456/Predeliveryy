import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { logAuditEvent } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionBodyToRow, inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    if (userDoc.role !== 'admin') {
      body.inspectorEmail = userDoc.email.toLowerCase();
    } else if (body.inspectorEmail) {
      body.inspectorEmail = body.inspectorEmail.toLowerCase();
    }

    if (!body.inspectionNumber) {
      body.inspectionNumber = `INSP-${Date.now()}`;
    }

    const row = inspectionBodyToRow(body) as Record<string, unknown>;
    const supabase = getSupabase();
    const { data: inserted, error } = await supabase
      .from('inspections')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    if (!inserted?.id) {
      return NextResponse.json({ success: false, error: 'Failed to create inspection' }, { status: 400 });
    }

    const { data: inspection } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inserted.id)
      .single();
    const inspectionData = inspection ? inspectionRowToInspection(inspection as InspectionRow) : null;

    await logAuditEvent(request, {
      action: 'inspection.created',
      resourceType: 'inspection',
      resourceId: inserted.id,
      details: {
        inspectionNumber: body.inspectionNumber,
        inspectorName: body.inspectorName,
        status: body.status ?? 'draft',
      },
    });

    return NextResponse.json({ success: true, data: inspectionData }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const supabase = getSupabase();
    let query = supabase.from('inspections').select('*').order('created_at', { ascending: false }).limit(100);

    if (userDoc.role !== 'admin') {
      query = query.eq('inspector_email', userDoc.email.toLowerCase());
    }

    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    if (searchParams.get('inspectorEmail') && userDoc.role === 'admin') {
      query = query.eq('inspector_email', searchParams.get('inspectorEmail'));
    }

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate) query = query.gte('inspection_date', startDate);
    if (endDate) query = query.lte('inspection_date', endDate);

    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const term = `%${searchTerm}%`;
      query = query.or(
        `inspection_number.ilike.${term},inspector_name.ilike.${term},inspector_email.ilike.${term},barcode.ilike.${term}`
      );
    }

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const inspections = (rows || []).map((r) => inspectionRowToInspection(r as InspectionRow));
    const response = NextResponse.json({ success: true, data: inspections });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
