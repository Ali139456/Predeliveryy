import AuditLog from '@/models/AuditLog';
import connectDB from '@/lib/mongodb';
import { NextRequest } from 'next/server';
import { getCurrentUser } from './auth';

export interface AuditLogData {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: {
    [key: string]: any;
  };
}

export async function logAuditEvent(
  request: NextRequest,
  data: AuditLogData
): Promise<void> {
  try {
    await connectDB();
    
    const user = await getCurrentUser(request);
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!user) {
      // Log anonymous actions if needed
      await AuditLog.create({
        userId: 'anonymous',
        userEmail: 'anonymous@system',
        userName: 'Anonymous User',
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
      return;
    }

    // Get user name from database if available
    let userName = user.email;
    try {
      const User = (await import('@/models/User')).default;
      const userDoc = await User.findById(user.userId).select('name email').lean() as any;
      if (userDoc && userDoc.name) {
        userName = userDoc.name;
      }
    } catch (err) {
      // If we can't get name, use email
    }

    await AuditLog.create({
      userId: user.userId,
      userEmail: user.email,
      userName: userName,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error('Audit log error:', error);
  }
}

export async function logAuditEventWithUser(
  userId: string,
  userEmail: string,
  userName: string,
  data: AuditLogData,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await connectDB();

    await AuditLog.create({
      userId,
      userEmail,
      userName,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Helper function to get client IP from request
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

