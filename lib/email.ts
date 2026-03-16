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
        error.message?.includes('Invalid Resend API key') ||
        error.message?.includes('too large to email')) {
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

/**
 * Send welcome email to a new user/inspector with login URL and temporary password.
 * Used when admin creates a new user.
 */
export async function sendNewUserCredentials(
  recipientEmail: string,
  name: string,
  password: string,
  loginUrl: string
): Promise<void> {
  if (!isResendConfigured()) {
    throw new Error('Email service is not configured. Set RESEND_API_KEY to send welcome emails.');
  }
  const client = getResendClient();
  if (!client) throw new Error('Resend client is not initialized.');
  ensureFromEmailForExternalSend();
  const fromEmail = getFromEmail();

  const subject = 'Your Pre Delivery Inspector Account';
  const safeName = name.replace(/</g, '&lt;');
  const safeEmail = recipientEmail.replace(/</g, '&lt;');
  const safePassword = password.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeLoginUrl = loginUrl.replace(/"/g, '&quot;');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pre Delivery</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color:#ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0033FF; background: linear-gradient(135deg, #0033FF 0%, #0029CC 100%); padding: 28px 32px; text-align: center;">
              <h1 style="margin:0; color:#ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Pre Delivery</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">Verified before your drive</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 20px; font-weight: 700;">Welcome, ${safeName}</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.5;">An administrator has created an inspector account for you. Use the details below to sign in.</p>
              <!-- Credentials card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Login URL</p>
                    <p style="margin: 0 0 16px;"><a href="${safeLoginUrl}" style="color: #0033FF; font-size: 14px; text-decoration: none; word-break: break-all;">${safeLoginUrl}</a></p>
                    <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Email</p>
                    <p style="margin: 0 0 16px; color: #0f172a; font-size: 14px;">${safeEmail}</p>
                    <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Temporary password</p>
                    <p style="margin: 0;"><code style="display: inline-block; background: #ffffff; color: #0f172a; padding: 10px 14px; border-radius: 8px; font-size: 15px; font-weight: 600; border: 1px solid #e2e8f0; letter-spacing: 0.02em;">${safePassword}</code></p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 20px;">
                    <a href="${safeLoginUrl}" style="display: inline-block; background-color: #0033FF; background: linear-gradient(135deg, #0033FF 0%, #0029CC 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">Log in to your account</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; padding: 14px 16px; background: #fffbeb; border-left: 4px solid #FF6600; border-radius: 6px; color: #92400e; font-size: 13px; line-height: 1.5;">We recommend changing your password after your first login.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">PreDelivery Global Pty Ltd</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const { data, error } = await client.emails.send({
    from: fromEmail,
    to: [recipientEmail],
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send welcome email.');
  }
  if (!data) {
    throw new Error('Welcome email failed: No response from Resend.');
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
      } else if (error.message?.includes('size limit') || error.message?.includes('40MB') || error.message?.includes('exceeded the size')) {
        throw new Error(
          'This report is too large to email (Resend limit 40MB). Please download the PDF and share it another way, or use an inspection with fewer photos.'
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
        error.message?.includes('Invalid Resend API key') ||
        error.message?.includes('too large to email')) {
      throw error;
    }
    
    // Provide more helpful error messages
    if (error.message?.includes('API key') || error.message?.includes('Unauthorized')) {
      throw new Error(
        'Invalid Resend API key. Please check your RESEND_API_KEY environment variable in Vercel.'
      );
    } else if (error.message?.includes('size limit') || error.message?.includes('40MB') || error.message?.includes('exceeded the size')) {
      throw new Error(
        'This report is too large to email (Resend limit 40MB). Please download the PDF and share it another way, or use an inspection with fewer photos.'
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
