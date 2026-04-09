import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/rateLimit';

const CONTACT_INBOX =
  process.env.CONTACT_INBOX_EMAIL?.trim() || 'info@predelivery.ai';

const ALLOWED_SUBJECTS = new Set(['General enquiry', 'Sales', 'Support']);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:contact', {
      windowSeconds: 3600,
      limit: 10,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid name.' },
        { status: 400 }
      );
    }
    if (
      !email ||
      email.length > 320 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    if (!subject || !ALLOWED_SUBJECTS.has(subject)) {
      return NextResponse.json(
        { success: false, error: 'Please choose a valid subject.' },
        { status: 400 }
      );
    }
    if (!message || message.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Please enter a message (max 10,000 characters).' },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    const html = `
      <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
        <p style="margin: 0 0 12px;"><strong>New message</strong> from the website contact form.</p>
        <table style="border-collapse: collapse; max-width: 560px;">
          <tr><td style="padding: 4px 12px 4px 0; vertical-align: top; color: #64748b;">Name</td><td style="padding: 4px 0;">${safeName}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; vertical-align: top; color: #64748b;">Email</td><td style="padding: 4px 0;"><a href="mailto:${encodeURIComponent(email)}">${safeEmail}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; vertical-align: top; color: #64748b;">Subject</td><td style="padding: 4px 0;">${safeSubject}</td></tr>
        </table>
        <p style="margin: 16px 0 8px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message</p>
        <div style="padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">${safeMessage}</div>
      </div>
    `.trim();

    await sendEmail(
      [CONTACT_INBOX],
      `[Contact] ${subject} — ${name}`,
      html
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Contact form error:', err);
    const msg =
      err instanceof Error ? err.message : 'Failed to send message.';
    const isConfig =
      msg.includes('not configured') ||
      msg.includes('RESEND') ||
      msg.includes('onboarding@resend.dev');
    return NextResponse.json(
      {
        success: false,
        error: isConfig
          ? 'Email is not configured on this server. Please use the address below or try again later.'
          : 'Failed to send message. Please try again or email us directly.',
      },
      { status: 500 }
    );
  }
}
