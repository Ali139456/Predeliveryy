import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { generatePDF } from '@/lib/pdfGenerator';
import { sendEmailWithPDF } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { recipients } = body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'Recipients are required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: row, error } = await supabase.from('inspections').select('*').eq('id', params.id).single();
    if (error || !row) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }
    const inspection = inspectionRowToInspection(row as InspectionRow);

    if (userDoc.role !== 'admin' && inspection.inspectorEmail?.toLowerCase() !== userDoc.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only email your own inspections' },
        { status: 403 }
      );
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(inspection);
    } catch (pdfError: unknown) {
      const msg = pdfError instanceof Error ? pdfError.message : 'Unknown error';
      return NextResponse.json({ success: false, error: `Failed to generate PDF: ${msg}` }, { status: 500 });
    }

    const pdfFileName = `Inspection-${inspection.inspectionNumber}-${Date.now()}.pdf`;
    const emailBody = `
      <h2>Pre delivery inspection Report</h2>
      <p>Dear Recipient,</p>
      <p>Please find attached the pre-delivery inspection report for inspection number: <strong>${inspection.inspectionNumber}</strong></p>
      <p><strong>Inspector:</strong> ${inspection.inspectorName}</p>
      <p><strong>Date:</strong> ${new Date(inspection.inspectionDate).toLocaleDateString()}</p>
      <p>This is an automated email. Please do not reply.</p>
    `;

    try {
      await sendEmailWithPDF(
        recipients,
        `Pre delivery inspection Report - ${inspection.inspectionNumber}`,
        emailBody,
        pdfBuffer,
        pdfFileName
      );
    } catch (emailError: unknown) {
      const msg = emailError instanceof Error ? emailError.message : 'Failed to send email. Please check your Resend configuration.';
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
