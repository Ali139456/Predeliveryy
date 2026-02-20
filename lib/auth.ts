import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function generateToken(user: { id: string; email: string; role: string }): Promise<string> {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest): Promise<JWTPayload | null> => {
    const user = await getCurrentUser(request);
    
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    if (roles && !roles.includes(user.role)) {
      throw new Error('Forbidden');
    }
    
    return user;
  };
}

