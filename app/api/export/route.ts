import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { generatePDF } from '@/lib/pdfGenerator';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';

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
    const id = searchParams.get('id');
    const supabase = getSupabase();

    if (id) {
      const { data: row, error } = await supabase.from('inspections').select('*').eq('id', id).single();
      if (error || !row) {
        return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
      }
      const inspection = inspectionRowToInspection(row as InspectionRow);
      if (userDoc.role !== 'admin' && inspection.inspectorEmail?.toLowerCase() !== userDoc.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only export your own inspections' },
          { status: 403 }
        );
      }

      try {
        const pdfBuffer = await generatePDF(inspection);
        if (!pdfBuffer || pdfBuffer.length === 0) {
          return NextResponse.json({ success: false, error: 'Failed to generate PDF - empty buffer' }, { status: 500 });
        }
        const uint8Array = Buffer.isBuffer(pdfBuffer) ? new Uint8Array(pdfBuffer) : new Uint8Array(pdfBuffer);
        const sanitizedNumber = inspection.inspectionNumber.replace(/[^a-z0-9.-]/gi, '_');
        return new NextResponse(uint8Array, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Inspection-${sanitizedNumber}.pdf"`,
            'Content-Length': uint8Array.length.toString(),
          },
        });
      } catch (pdfError: unknown) {
        const msg = pdfError instanceof Error ? pdfError.message : 'Unknown error';
        return NextResponse.json({ success: false, error: `PDF generation failed: ${msg}` }, { status: 500 });
      }
    }

    let query = supabase.from('inspections').select('*').order('created_at', { ascending: false });
    if (userDoc.role !== 'admin') {
      query = query.eq('inspector_email', userDoc.email.toLowerCase());
    }
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate) query = query.gte('inspection_date', startDate);
    if (endDate) query = query.lte('inspection_date', endDate);
    const { data: rows } = await query;
    const inspections = (rows || []).map((r) => inspectionRowToInspection(r as InspectionRow));
    return NextResponse.json({ success: true, data: inspections });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
