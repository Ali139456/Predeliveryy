import { authenticator } from 'otplib';

const APP_NAME = 'Pre Delivery';

authenticator.options = { window: 1 };

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export function verifyMfaCode(secret: string, code: string): boolean {
  const token = String(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(token)) return false;
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function getMfaOtpAuthUrl(email: string, secret: string): string {
  return authenticator.keyuri(email, APP_NAME, secret);
}
