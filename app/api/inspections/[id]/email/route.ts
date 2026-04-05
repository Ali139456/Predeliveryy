import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { generatePDF } from '@/lib/pdfGenerator';
import { sendEmailWithPDF } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';
import { logAuditEvent } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const emailRecipientsSchema = z.object({
  recipients: z.array(z.string().email().max(320)).min(1).max(25),
});

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:inspections:email', {
      windowSeconds: 60,
      limit: 15,
      scope: 'ip+user',
    });
    if (!allowed) {
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

    const raw = await request.json();
    const parsed = emailRecipientsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Provide 1–25 valid recipient email addresses' },
        { status: 400 }
      );
    }
    const { recipients } = parsed.data;

    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', user.tenantId)
      .single();
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

    // Lighter PDF for email (capped + compressed images). Resend ~40MB; keep margin for API/base64.
    const RESEND_EMAIL_SIZE_LIMIT_BYTES = 34 * 1024 * 1024;
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(inspection, { forEmail: true });
      if (pdfBuffer.length > RESEND_EMAIL_SIZE_LIMIT_BYTES) {
        pdfBuffer = await generatePDF(inspection, { forEmail: true, maxChecklistPhotosEmail: 18 });
      }
      if (pdfBuffer.length > RESEND_EMAIL_SIZE_LIMIT_BYTES) {
        pdfBuffer = await generatePDF(inspection, { forEmail: true, maxChecklistPhotosEmail: 10 });
      }
    } catch (pdfError: unknown) {
      const msg = pdfError instanceof Error ? pdfError.message : 'Unknown error';
      return NextResponse.json({ success: false, error: `Failed to generate PDF: ${msg}` }, { status: 500 });
    }
    if (pdfBuffer.length > RESEND_EMAIL_SIZE_LIMIT_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This report is still too large to email after compressing images. Please use Export PDF and share the file or a link instead.',
        },
        { status: 413 }
      );
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

    await logAuditEvent(request, {
      action: 'inspection.emailed',
      resourceType: 'inspection',
      resourceId: params.id,
      details: {
        inspectionNumber: inspection.inspectionNumber,
        recipientCount: recipients.length,
      },
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
