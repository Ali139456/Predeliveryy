import jwt, { type JwtPayload } from 'jsonwebtoken';

const PURPOSE = 'password-reset' as const;

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is required');
  return s;
}

/** Short-lived token embedded in the password-reset email link (serverless-safe; no DB row). */
export function signPasswordResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email: email.toLowerCase(), purpose: PURPOSE },
    secret(),
    { expiresIn: '1h' }
  );
}

export function verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = jwt.verify(token, secret()) as JwtPayload & {
      userId?: string;
      email?: string;
      purpose?: string;
    };
    if (payload.purpose !== PURPOSE || !payload.userId || !payload.email) return null;
    return { userId: payload.userId, email: String(payload.email).toLowerCase() };
  } catch {
    return null;
  }
}
