// OTP storage utility
// In production, use Redis or a database collection for OTP storage

interface OTPData {
  otp: string;
  expiresAt: number;
  userId: string;
}

// In-memory store (for development)
// In production, use Redis or MongoDB collection
const otpStore = new Map<string, OTPData>();

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP
export function storeOTP(identifier: string, otp: string, userId: string, expiresInMinutes: number = 10): void {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  otpStore.set(identifier, {
    otp,
    expiresAt,
    userId,
  });
}

// Get OTP data
export function getOTP(identifier: string): OTPData | null {
  const data = otpStore.get(identifier);
  if (!data) return null;
  
  // Check if expired
  if (Date.now() > data.expiresAt) {
    otpStore.delete(identifier);
    return null;
  }
  
  return data;
}

// Verify and remove OTP
export function verifyAndRemoveOTP(identifier: string, otp: string): { valid: boolean; userId: string | null } {
  const data = getOTP(identifier);
  
  if (!data) {
    return { valid: false, userId: null };
  }
  
  if (data.otp !== otp) {
    return { valid: false, userId: null };
  }
  
  // Remove OTP after verification
  otpStore.delete(identifier);
  
  return { valid: true, userId: data.userId };
}

// Clean up expired OTPs (call periodically)
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [identifier, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(identifier);
    }
  }
}

