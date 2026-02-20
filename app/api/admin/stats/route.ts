import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import type { InspectionRow } from '@/types/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin', 'manager'])(request);
    const supabase = getSupabase();

    const [
      { count: totalInspections },
      { count: completedInspections },
      { count: draftInspections },
      { count: totalUsers },
      { count: activeUsers },
    ] = await Promise.all([
      supabase.from('inspections').select('*', { count: 'exact', head: true }),
      supabase.from('inspections').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('inspections').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data: recentRows } = await supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: allRecent } = await supabase
      .from('inspections')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    const monthlyMap: Record<string, number> = {};
    (allRecent || []).forEach((row: { created_at: string }) => {
      const d = new Date(row.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });
    const monthly = Object.entries(monthlyMap)
      .map(([_id, count]) => ({ _id: { year: parseInt(_id.slice(0, 4), 10), month: parseInt(_id.slice(5, 7), 10) }, count }))
      .sort((a, b) => (a._id.year !== b._id.year ? a._id.year - b._id.year : a._id.month - b._id.month));

    const recent = (recentRows || []).map((r) => {
      const id = (r as InspectionRow).id;
      return {
        id,
        _id: id,
        inspectionNumber: (r as InspectionRow).inspection_number,
        inspectorName: (r as InspectionRow).inspector_name,
        status: (r as InspectionRow).status,
        createdAt: (r as InspectionRow).created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        inspections: {
          total: totalInspections ?? 0,
          completed: completedInspections ?? 0,
          draft: draftInspections ?? 0,
          byStatus: { completed: completedInspections ?? 0, draft: draftInspections ?? 0 },
          monthly,
        },
        users: {
          total: totalUsers ?? 0,
          active: activeUsers ?? 0,
          inactive: (totalUsers ?? 0) - (activeUsers ?? 0),
        },
        recent,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch stats';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
