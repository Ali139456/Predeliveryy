import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin'])(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).lean();

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Timestamp', 'User', 'Email', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address'];
      const rows = logs.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.userName,
        log.userEmail,
        log.action,
        log.resourceType,
        log.resourceId || '',
        JSON.stringify(log.details || {}),
        log.ipAddress || '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${Date.now()}.csv"`,
        },
      });
    } else {
      // JSON format
      return NextResponse.json({
        success: true,
        data: logs,
        count: logs.length,
      });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export audit logs' },
      { status: 500 }
    );
  }
}

