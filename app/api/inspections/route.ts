import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { logAuditEvent } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionBodyToRow, inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';
import { enforceRateLimit } from '@/lib/rateLimit';
import { parseInspectionApiBody } from '@/lib/inspectionApiValidation';
import { syncInspectionAnalytics } from '@/lib/analytics-sync';
import { canMutateInspections, canViewAllTenantInspections } from '@/lib/roles';

export async function POST(request: NextRequest) {
  try {
    const rl = await enforceRateLimit(request, 'api:inspections:post', { windowSeconds: 60, limit: 30, scope: 'ip+user' });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (!canMutateInspections(userDoc.role)) {
      return NextResponse.json({ success: false, error: 'Read-only access' }, { status: 403 });
    }

    const raw = await request.json();
    const parsed = parseInspectionApiBody(raw, 'create');
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }
    const body = parsed.data;
    if (body.privacyConsent === undefined) {
      body.privacyConsent = true;
    }
    body.tenantId = user.tenantId;

    if (userDoc.role !== 'admin') {
      body.inspectorEmail = userDoc.email.toLowerCase();
    } else if (typeof body.inspectorEmail === 'string' && body.inspectorEmail) {
      body.inspectorEmail = body.inspectorEmail.toLowerCase();
    }

    const supabase = getSupabase();
    if (!body.inspectionNumber) {
      // Per-type numbering: each inspection type gets its own counter so the
      // three product lines never share a number. Legacy "PD 1031"-style
      // PDIs continue seamlessly via the digit regex below.
      const PREFIX_BY_TYPE: Record<'pdi' | 'blue_slip' | 'pink_slip', string> = {
        pdi: 'PD',
        blue_slip: 'BS',
        pink_slip: 'PS',
      };
      const inspectionType = ((body.inspectionType as 'pdi' | 'blue_slip' | 'pink_slip' | undefined) ?? 'pdi');
      const prefix = PREFIX_BY_TYPE[inspectionType] ?? 'PD';

      const { data: rows } = await supabase
        .from('inspections')
        .select('inspection_number')
        .eq('tenant_id', user.tenantId)
        .eq('inspection_type', inspectionType);

      let maxNum = 0;
      (rows || []).forEach((r: { inspection_number?: string }) => {
        const match = String(r?.inspection_number ?? '').match(/(\d+)/);
        const n = match ? parseInt(match[1], 10) : NaN;
        if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
      });

      body.inspectionNumber = `${prefix}-${String(maxNum + 1).padStart(4, '0')}`;
    }

    const row = inspectionBodyToRow(body) as Record<string, unknown>;
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

    if (inspection && (inspection as InspectionRow).status === 'completed') {
      try {
        await syncInspectionAnalytics(supabase, inspection as InspectionRow);
      } catch (syncErr) {
        console.error('[analytics-sync] create', syncErr);
      }
    }

    return NextResponse.json({ success: true, data: inspectionData }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const rl = await enforceRateLimit(request, 'api:inspections:get', { windowSeconds: 60, limit: 120, scope: 'ip+user' });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
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
    // List view: select only fields needed for table (no photos, checklist, signatures) for faster response
    const listFields = 'id, inspection_number, inspector_name, inspector_email, inspection_date, status, barcode, created_at';
    let query = supabase
      .from('inspections')
      .select(listFields)
      .eq('tenant_id', user.tenantId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!canViewAllTenantInspections(userDoc.role)) {
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

    const inspections = (rows || []).map((r: Record<string, unknown>) => ({
      _id: r.id,
      id: r.id,
      inspectionNumber: r.inspection_number,
      inspectorName: r.inspector_name,
      inspectorEmail: r.inspector_email,
      inspectionDate: r.inspection_date,
      status: r.status,
      barcode: r.barcode ?? undefined,
      createdAt: r.created_at,
    }));

    await logAuditEvent(request, {
      action: 'inspection.list_accessed',
      resourceType: 'inspection',
      resourceId: undefined,
      details: {
        resultCount: inspections.length,
        status: status || null,
        dateRange: startDate || endDate ? { startDate: startDate || null, endDate: endDate || null } : null,
        search: searchTerm ? true : false,
        inspectorFilter: userDoc.role === 'admin' && searchParams.get('inspectorEmail') ? true : false,
      },
    });

    const response = NextResponse.json({ success: true, data: inspections });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
