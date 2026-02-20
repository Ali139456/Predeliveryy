import getSupabase from '@/lib/supabase';
import { NextRequest } from 'next/server';
import { getCurrentUser } from './auth';

export interface AuditLogData {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export async function logAuditEvent(
  request: NextRequest,
  data: AuditLogData
): Promise<void> {
  try {
    const supabase = getSupabase();
    const user = await getCurrentUser(request);
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const payload = {
      user_id: user ? user.userId : 'anonymous',
      user_email: user ? user.email : 'anonymous@system',
      user_name: user ? user.email : 'Anonymous User',
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId ?? null,
      details: data.details ?? {},
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    };

    if (user) {
      const { data: userRow } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.userId)
        .single();
      if (userRow?.name) payload.user_name = userRow.name;
    }

    await supabase.from('audit_logs').insert(payload);
  } catch (error) {
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
    const supabase = getSupabase();
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId ?? null,
      details: data.details ?? {},
      ip_address: ipAddress || 'unknown',
      user_agent: userAgent || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
