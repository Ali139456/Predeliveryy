import type { SupabaseClient } from '@supabase/supabase-js';

export type AnalyticsDayMetrics = {
  inspected: number;
  passRate: number;
  reviewRate: number;
  avgInspectionMinutes: number | null;
  photosCaptured: number;
};

export type AnalyticsVolumePoint = {
  date: string;
  label: string;
  count: number;
};

export type AnalyticsDefectCategory = {
  category: string;
  count: number;
};

function dayBoundsUtc(dateStr: string): { start: string; end: string } {
  return {
    start: `${dateStr}T00:00:00.000Z`,
    end: `${dateStr}T23:59:59.999Z`,
  };
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatChartLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

async function metricsForDay(
  supabase: SupabaseClient,
  tenantId: string,
  dateStr: string,
  location: string
): Promise<AnalyticsDayMetrics> {
  const { start, end } = dayBoundsUtc(dateStr);
  let q = supabase
    .from('analytics_inspection_summary')
    .select('is_pass, needs_review, duration_minutes, photo_count')
    .eq('tenant_id', tenantId)
    .gte('completed_at', start)
    .lte('completed_at', end);

  if (location && location !== 'all') {
    q = q.eq('location_label', location);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const rows = data || [];
  const inspected = rows.length;
  if (inspected === 0) {
    return {
      inspected: 0,
      passRate: 0,
      reviewRate: 0,
      avgInspectionMinutes: null,
      photosCaptured: 0,
    };
  }

  const passCount = rows.filter((r) => r.is_pass).length;
  const reviewCount = rows.filter((r) => r.needs_review).length;
  const durations = rows
    .map((r) => r.duration_minutes)
    .filter((m): m is number => typeof m === 'number' && m > 0);
  const avgInspectionMinutes =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;
  const photosCaptured = rows.reduce((sum, r) => sum + (r.photo_count || 0), 0);

  return {
    inspected,
    passRate: Math.round((passCount / inspected) * 1000) / 10,
    reviewRate: Math.round((reviewCount / inspected) * 1000) / 10,
    avgInspectionMinutes,
    photosCaptured,
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function fetchAnalyticsDashboard(
  supabase: SupabaseClient,
  tenantId: string,
  dateStr: string,
  location: string
) {
  const yesterday = addDays(dateStr, -1);

  const [today, prior, locationsRes] = await Promise.all([
    metricsForDay(supabase, tenantId, dateStr, location),
    metricsForDay(supabase, tenantId, yesterday, location),
    supabase
      .from('analytics_inspection_summary')
      .select('location_label')
      .eq('tenant_id', tenantId),
  ]);

  const locationSet = new Set<string>();
  (locationsRes.data || []).forEach((r: { location_label?: string }) => {
    if (r.location_label && r.location_label !== 'Unknown') locationSet.add(r.location_label);
  });
  const locations = ['all', ...Array.from(locationSet).sort()];

  const volume7Days: AnalyticsVolumePoint[] = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const d = addDays(dateStr, -offset);
      return metricsForDay(supabase, tenantId, d, location).then((m) => ({
        date: d,
        label: formatChartLabel(d),
        count: m.inspected,
      }));
    })
  );

  const rangeStart = dayBoundsUtc(addDays(dateStr, -6)).start;
  const rangeEnd = dayBoundsUtc(dateStr).end;

  let defectQ = supabase
    .from('analytics_checklist_items')
    .select('category')
    .eq('tenant_id', tenantId)
    .eq('is_defect', true)
    .gte('completed_at', rangeStart)
    .lte('completed_at', rangeEnd);

  if (location && location !== 'all') {
    defectQ = defectQ.eq('location_label', location);
  }

  const { data: defectRows, error: defectErr } = await defectQ;
  if (defectErr) throw new Error(defectErr.message);

  const categoryMap: Record<string, number> = {};
  (defectRows || []).forEach((r: { category?: string }) => {
    const cat = r.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const topDefectCategories: AnalyticsDefectCategory[] = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    date: dateStr,
    location,
    locations,
    kpis: {
      vehiclesInspected: {
        value: today.inspected,
        changePct: pctChange(today.inspected, prior.inspected),
      },
      passRate: {
        value: today.passRate,
        changePct:
          prior.passRate > 0 || today.passRate > 0
            ? Math.round((today.passRate - prior.passRate) * 10) / 10
            : null,
      },
      reviewRate: {
        value: today.reviewRate,
        changePct:
          prior.reviewRate > 0 || today.reviewRate > 0
            ? Math.round((today.reviewRate - prior.reviewRate) * 10) / 10
            : null,
      },
      avgInspectionMinutes: {
        value: today.avgInspectionMinutes,
        changeMinutes:
          today.avgInspectionMinutes != null && prior.avgInspectionMinutes != null
            ? today.avgInspectionMinutes - prior.avgInspectionMinutes
            : null,
      },
      photosCaptured: {
        value: today.photosCaptured,
        changePct: pctChange(today.photosCaptured, prior.photosCaptured),
      },
    },
    volume7Days,
    topDefectCategories,
  };
}
