import nodemailer from 'nodemailer';

// Check if SMTP is configured
function isSMTPConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );
}

// Get SMTP configuration with defaults
function getSMTPConfig() {
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || user;
  
  // Determine if secure based on port
  const secure = port === 465;
  
  // Determine if we need STARTTLS (for ports 587, 25, etc.)
  const requireTLS = port === 587 || port === 25;
  
  return {
    host,
    port,
    secure,
    requireTLS,
    auth: {
      user,
      pass,
    },
    from,
  };
}

// Create transporter dynamically based on configuration
function createTransporter() {
  if (!isSMTPConfigured()) {
    return null;
  }

  const config = getSMTPConfig();
  
  try {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: config.requireTLS,
      auth: config.auth,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
}

// Create transporter
let transporter: nodemailer.Transporter | null = createTransporter();

export async function sendEmailWithPDF(
  recipients: string[],
  subject: string,
  body: string,
  pdfBuffer: Buffer,
  pdfFileName: string
): Promise<void> {
  // Check if SMTP is configured
  if (!isSMTPConfigured()) {
    const config = getSMTPConfig();
    const provider = getProviderName(config.host);
    
    throw new Error(
      `Email service is not configured. Please set up SMTP settings in your .env.local file.\n\n` +
      `Example for ${provider}:\n` +
      `SMTP_HOST=${config.host || 'smtp.example.com'}\n` +
      `SMTP_PORT=${config.port}\n` +
      `SMTP_USER=your_email@example.com\n` +
      `SMTP_PASS=your_password_or_app_password\n` +
      `SMTP_FROM=your_email@example.com\n\n` +
      `Note: Recipients can be ANY email address. SMTP settings are for the sending service only.`
    );
  }

  // Recreate transporter in case config changed
  transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email transporter is not initialized. Please check your SMTP configuration.');
  }

  const config = getSMTPConfig();

  const mailOptions = {
    from: config.from,
    to: recipients.join(', '), // Recipients can be ANY email address
    subject,
    html: body,
    attachments: [
      {
        filename: pdfFileName,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    // Provide more helpful error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Cannot connect to SMTP server at ${config.host}:${config.port}. ` +
        'Please check your SMTP_HOST and SMTP_PORT settings.'
      );
    } else if (error.code === 'EAUTH') {
      throw new Error(
        'SMTP authentication failed. Please check your SMTP_USER and SMTP_PASS settings. ' +
        'Make sure you\'re using the correct credentials for your email provider.'
      );
    } else {
      throw new Error(
        `Failed to send email: ${error.message || 'Unknown error'}. ` +
        'Please check your SMTP configuration.'
      );
    }
  }
}

// Helper function to get provider name from host
function getProviderName(host: string): string {
  if (host.includes('gmail')) return 'Gmail';
  if (host.includes('outlook') || host.includes('office365')) return 'Outlook/Office365';
  if (host.includes('yahoo')) return 'Yahoo';
  if (host.includes('icloud')) return 'iCloud';
  return 'your email provider';
}


