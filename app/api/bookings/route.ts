import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/rateLimit';
import { INSPECTION_TYPES, inspectionTypeLabel, type InspectionType } from '@/lib/checklist-template';

const BOOKING_INBOX =
  process.env.BOOKINGS_INBOX_EMAIL?.trim() ||
  process.env.CONTACT_INBOX_EMAIL?.trim() ||
  'info@predelivery.ai';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pickString(v: unknown, max = 200): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

const ALLOWED_TYPES: ReadonlySet<InspectionType> = new Set(INSPECTION_TYPES);

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:bookings', {
      windowSeconds: 3600,
      limit: 8,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many booking requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const inspectionTypeRaw = pickString((body as Record<string, unknown>).inspectionType, 32) as InspectionType;
    if (!ALLOWED_TYPES.has(inspectionTypeRaw)) {
      return NextResponse.json(
        { success: false, error: 'Please choose a valid inspection type.' },
        { status: 400 }
      );
    }

    const customerName = pickString((body as Record<string, unknown>).customerName, 200);
    const customerEmail = pickString((body as Record<string, unknown>).customerEmail, 320);
    const customerPhone = pickString((body as Record<string, unknown>).customerPhone, 32);
    const vehicleMake = pickString((body as Record<string, unknown>).vehicleMake, 80);
    const vehicleModel = pickString((body as Record<string, unknown>).vehicleModel, 80);
    const vehicleYear = pickString((body as Record<string, unknown>).vehicleYear, 8);
    const vehicleRego = pickString((body as Record<string, unknown>).vehicleRego, 16);
    const vehicleVin = pickString((body as Record<string, unknown>).vehicleVin, 32);
    const preferredDate = pickString((body as Record<string, unknown>).preferredDate, 16);
    const preferredTimeSlot = pickString((body as Record<string, unknown>).preferredTimeSlot, 32);
    const notes = pickString((body as Record<string, unknown>).notes, 2000);

    if (!customerName) {
      return NextResponse.json(
        { success: false, error: 'Please enter your name.' },
        { status: 400 }
      );
    }
    if (
      !customerEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    ) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    if (!vehicleMake && !vehicleModel && !vehicleRego && !vehicleVin) {
      return NextResponse.json(
        { success: false, error: 'Please provide at least make/model or rego/VIN.' },
        { status: 400 }
      );
    }
    let dateForDb: string | null = null;
    if (preferredDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        return NextResponse.json(
          { success: false, error: 'Preferred date must be YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      dateForDb = preferredDate;
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inspection_bookings')
      .insert({
        inspection_type: inspectionTypeRaw,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        vehicle_make: vehicleMake || null,
        vehicle_model: vehicleModel || null,
        vehicle_year: vehicleYear || null,
        vehicle_rego: vehicleRego || null,
        vehicle_vin: vehicleVin || null,
        preferred_date: dateForDb,
        preferred_time_slot: preferredTimeSlot || null,
        notes: notes || null,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select('id, inspection_type, created_at')
      .single();

    if (error || !data) {
      console.error('Booking insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Could not save booking. Please try again.' },
        { status: 500 }
      );
    }

    const typeLabel = inspectionTypeLabel(inspectionTypeRaw);
    const vehicleSummary = [vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(' ').trim() || '-';
    const html = `
      <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
        <p style="margin: 0 0 12px;"><strong>New ${escapeHtml(typeLabel)} booking</strong> from the website.</p>
        <table style="border-collapse: collapse; max-width: 600px;">
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Customer</td><td style="padding: 4px 0;">${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Email</td><td style="padding: 4px 0;"><a href="mailto:${encodeURIComponent(customerEmail)}">${escapeHtml(customerEmail)}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Phone</td><td style="padding: 4px 0;">${escapeHtml(customerPhone || '-')}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Inspection</td><td style="padding: 4px 0;"><strong>${escapeHtml(typeLabel)}</strong></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Vehicle</td><td style="padding: 4px 0;">${escapeHtml(vehicleSummary)}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Rego</td><td style="padding: 4px 0;">${escapeHtml(vehicleRego || '-')}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">VIN</td><td style="padding: 4px 0;">${escapeHtml(vehicleVin || '-')}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Preferred date</td><td style="padding: 4px 0;">${escapeHtml(preferredDate || '-')} ${escapeHtml(preferredTimeSlot || '')}</td></tr>
        </table>
        ${
          notes
            ? `<p style="margin: 16px 0 8px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Notes</p>
               <div style="padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">${escapeHtml(
                 notes
               ).replace(/\n/g, '<br/>')}</div>`
            : ''
        }
        <p style="margin: 16px 0 0; color: #64748b; font-size: 12px;">Booking ID: ${escapeHtml(String(data.id))}</p>
      </div>
    `.trim();

    // Best-effort email; do not fail the booking if email is misconfigured.
    try {
      await sendEmail([BOOKING_INBOX], `New ${typeLabel} booking - ${customerName}`, html);
    } catch (mailErr) {
      console.warn('Booking email failed (saved anyway):', mailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId: data.id,
      message: 'Booking received. Our team will be in touch shortly.',
    });
  } catch (err: unknown) {
    console.error('Booking submission error:', err);
    return NextResponse.json(
      { success: false, error: 'Could not submit booking. Please try again.' },
      { status: 500 }
    );
  }
}
