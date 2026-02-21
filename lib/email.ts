import { Resend } from 'resend';

// Check if Resend is configured
function isResendConfigured(): boolean {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== ''
  );
}

// Initialize Resend client
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!isResendConfigured()) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

// Get the from email address (must be set in production for verified domain)
function getFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (from && from !== '') return from;
  return 'onboarding@resend.dev';
}

function ensureFromEmailForExternalSend(): void {
  const from = getFromEmail();
  if (from === 'onboarding@resend.dev') {
    throw new Error(
      'Cannot send to external emails with onboarding@resend.dev. ' +
      'Set RESEND_FROM_EMAIL in Vercel (Environment Variables) to an address on your verified domain, e.g. "Pre Delivery <noreply@predelivery.ai>" or "reports@predelivery.ai". ' +
      'Then redeploy. Resend → Domains shows predelivery.ai as Verified; the app must use that domain as the sender.'
    );
  }
}

export async function sendEmail(
  recipients: string[],
  subject: string,
  body: string
): Promise<void> {
  // Check if Resend is configured
  if (!isResendConfigured()) {
    throw new Error(
      `Email service is not configured. Please set up Resend API key in your environment variables.`
    );
  }

  const client = getResendClient();
  
  if (!client) {
    throw new Error('Resend client is not initialized. Please check your RESEND_API_KEY configuration.');
  }

  ensureFromEmailForExternalSend();
  const fromEmail = getFromEmail();

  try {
    // Send email to all recipients
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html: body,
    });

    if (error) {
      // Check for specific Resend error types
      if (error.message?.includes('API key') || error.message?.includes('Unauthorized')) {
        throw new Error(
          'Invalid Resend API key. Please check your RESEND_API_KEY environment variable.'
        );
      } else if (error.message?.includes('domain') || error.message?.includes('not verified') || error.message?.includes('from')) {
        throw new Error(
          `Cannot send to external emails with ${fromEmail}. ` +
          'Please verify a domain in Resend and set RESEND_FROM_EMAIL to your verified email address.'
        );
      } else {
        throw new Error(
          `Failed to send email via Resend: ${error.message || 'Unknown error'}.`
        );
      }
    }

    if (!data) {
      throw new Error('Email sending failed: No response from Resend API.');
    }
  } catch (error: any) {
    // Re-throw if it's already a formatted error
    if (error.message?.includes('Cannot send to external emails') || 
        error.message?.includes('Invalid Resend API key')) {
      throw error;
    }
    
    // Provide more helpful error messages
    if (error.message?.includes('API key') || error.message?.includes('Unauthorized')) {
      throw new Error(
        'Invalid Resend API key. Please check your RESEND_API_KEY environment variable.'
      );
    } else if (error.message?.includes('domain') || error.message?.includes('not verified') || error.message?.includes('from')) {
      throw new Error(
        `Cannot send to external emails with ${fromEmail}. ` +
        'Please verify a domain in Resend and set RESEND_FROM_EMAIL to your verified email address.'
      );
    } else {
      throw new Error(
        `Failed to send email: ${error.message || 'Unknown error'}.`
      );
    }
  }
}

export async function sendEmailWithPDF(
  recipients: string[],
  subject: string,
  body: string,
  pdfBuffer: Buffer,
  pdfFileName: string
): Promise<void> {
  // Check if Resend is configured
  if (!isResendConfigured()) {
    throw new Error(
      `Email service is not configured. Please set up Resend API key in your environment variables.\n\n` +
      `Required environment variable:\n` +
      `RESEND_API_KEY=your_resend_api_key\n\n` +
      `Optional:\n` +
      `RESEND_FROM_EMAIL=your-verified-email@yourdomain.com\n\n` +
      `To get your Resend API key:\n` +
      `1. Sign up at https://resend.com\n` +
      `2. Go to API Keys section\n` +
      `3. Create a new API key\n` +
      `4. Add it to your environment variables\n\n` +
      `Note: You can send to ANY email address. The from email must be verified in Resend.`
    );
  }

  const client = getResendClient();
  
  if (!client) {
    throw new Error('Resend client is not initialized. Please check your RESEND_API_KEY configuration.');
  }

  ensureFromEmailForExternalSend();
  const fromEmail = getFromEmail();

  try {
    // Convert PDF buffer to base64 for Resend attachment
    const pdfBase64 = pdfBuffer.toString('base64');

    // Send email to all recipients
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: recipients,
    subject,
    html: body,
    attachments: [
      {
        filename: pdfFileName,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      // Check for specific Resend error types
      if (error.message?.includes('API key') || error.message?.includes('Unauthorized')) {
        throw new Error(
          'Invalid Resend API key. Please check your RESEND_API_KEY environment variable in Vercel.'
        );
      } else if (error.message?.includes('domain') || error.message?.includes('not verified') || error.message?.includes('from')) {
        throw new Error(
          `Cannot send to external emails with ${fromEmail}. ` +
          'Please verify a domain in Resend and set RESEND_FROM_EMAIL to your verified email address. ' +
          'The default onboarding@resend.dev can only send to your Resend account email.'
        );
      } else {
        throw new Error(
          `Failed to send email via Resend: ${error.message || 'Unknown error'}. ` +
          'Please check your Resend configuration.'
        );
      }
    }

    if (!data) {
      throw new Error('Email sending failed: No response from Resend API.');
    }
  } catch (error: any) {
    // Re-throw if it's already a formatted error
    if (error.message?.includes('Cannot send to external emails') || 
        error.message?.includes('Invalid Resend API key')) {
      throw error;
    }
    
    // Provide more helpful error messages
    if (error.message?.includes('API key') || error.message?.includes('Unauthorized')) {
      throw new Error(
        'Invalid Resend API key. Please check your RESEND_API_KEY environment variable in Vercel.'
      );
    } else if (error.message?.includes('domain') || error.message?.includes('not verified') || error.message?.includes('from')) {
      throw new Error(
        `Cannot send to external emails with ${fromEmail}. ` +
        'Please verify a domain in Resend and set RESEND_FROM_EMAIL to your verified email address. ' +
        'The default onboarding@resend.dev can only send to your Resend account email.'
      );
    } else {
      throw new Error(
        `Failed to send email: ${error.message || 'Unknown error'}. ` +
        'Please check your Resend configuration.'
      );
    }
  }
}
