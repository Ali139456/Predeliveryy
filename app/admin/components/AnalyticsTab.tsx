'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Car, CheckCircle, Search, Clock, Camera, BarChart3, Loader2 } from 'lucide-react';
import {
  AdminKpiCard,
  AdminPageHeader,
  AdminPanel,
  AdminInput,
  AdminSelect,
} from '@/components/admin/AdminUI';

type KpiChange = { value: number | null; changePct?: number | null; changeMinutes?: number | null };

type AnalyticsData = {
  date: string;
  location: string;
  locations: string[];
  kpis: {
    vehiclesInspected: KpiChange & { value: number };
    passRate: KpiChange & { value: number };
    reviewRate: KpiChange & { value: number };
    avgInspectionMinutes: KpiChange & { value: number | null };
    photosCaptured: KpiChange & { value: number };
  };
  volume7Days: Array<{ date: string; label: string; count: number }>;
  topDefectCategories: Array<{ category: string; count: number }>;
};

function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function trendFlags(sub?: string | null) {
  return { trendUp: !!sub?.startsWith('+'), trendDown: !!sub?.startsWith('-') };
}

export default function AnalyticsTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [location, setLocation] = useState('all');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ date, location });
      const res = await fetch(`/api/admin/analytics?${params}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to load analytics');
      }
      setData(json.data);
      if (json.data.locations?.length && !json.data.locations.includes(location)) {
        setLocation('all');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [date, location]);

  useEffect(() => {
    void load();
  }, [load]);

  const k = data?.kpis;

  const vehiclesSub =
    k?.vehiclesInspected.changePct != null
      ? `${k.vehiclesInspected.changePct >= 0 ? '+' : ''}${k.vehiclesInspected.changePct}% vs yesterday`
      : null;
  const passSub =
    k?.passRate.changePct != null
      ? `${k.passRate.changePct >= 0 ? '+' : ''}${k.passRate.changePct}% vs yesterday`
      : null;
  const reviewSub =
    k?.reviewRate.changePct != null
      ? `${k.reviewRate.changePct >= 0 ? '+' : ''}${k.reviewRate.changePct}% vs yesterday`
      : null;
  const timeSub =
    k?.avgInspectionMinutes.changeMinutes != null
      ? `${k.avgInspectionMinutes.changeMinutes >= 0 ? '+' : ''}${k.avgInspectionMinutes.changeMinutes}m vs yesterday`
      : null;
  const photosSub =
    k?.photosCaptured.changePct != null
      ? `${k.photosCaptured.changePct >= 0 ? '+' : ''}${k.photosCaptured.changePct}% vs yesterday`
      : null;

  const defectChart = (data?.topDefectCategories || []).map((d) => ({
    name: d.category.length > 28 ? `${d.category.slice(0, 26)}…` : d.category,
    fullName: d.category,
    count: d.count,
  }));

  return (
    <div className="space-y-6 min-w-0">
      <AdminPageHeader
        icon={BarChart3}
        title="Analytics"
        subtitle="Organisation inspection intelligence — completed inspections only."
        actions={
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col text-xs font-semibold text-slate-600 gap-1.5">
              Date
              <AdminInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-600 gap-1.5">
              Location
              <AdminSelect
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-w-[140px]"
              >
                {(data?.locations || ['all']).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </AdminSelect>
            </label>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
          {error.includes('does not exist') || error.includes('relation') ? (
            <p className="mt-2 text-xs">
              Run migration <code className="bg-red-100 px-1 rounded">009_analytics_tables.sql</code> in Supabase, then
              backfill: <code className="bg-red-100 px-1 rounded">node scripts/backfill-analytics.js</code>
            </p>
          ) : null}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#0033FF]">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-slate-700 font-medium">Loading analytics…</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Showing data for <span className="font-semibold text-slate-900">{formatDisplayDate(date)}</span>
            {location !== 'all' ? ` · ${location}` : ''}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <AdminKpiCard
              title="Vehicles inspected"
              value={String(k?.vehiclesInspected.value ?? 0)}
              sub={vehiclesSub}
              icon={Car}
              {...trendFlags(vehiclesSub)}
            />
            <AdminKpiCard
              title="Pass rate"
              value={`${k?.passRate.value ?? 0}%`}
              sub={passSub}
              icon={CheckCircle}
              {...trendFlags(passSub)}
            />
            <AdminKpiCard
              title="Review rate"
              value={`${k?.reviewRate.value ?? 0}%`}
              sub={reviewSub}
              positiveIsGood={false}
              icon={Search}
              {...trendFlags(reviewSub)}
            />
            <AdminKpiCard
              title="Avg inspection time"
              value={k?.avgInspectionMinutes.value != null ? `${k.avgInspectionMinutes.value}m` : '—'}
              sub={timeSub}
              icon={Clock}
              {...trendFlags(timeSub)}
            />
            <AdminKpiCard
              title="Photos captured"
              value={(k?.photosCaptured.value ?? 0).toLocaleString()}
              sub={photosSub}
              icon={Camera}
              {...trendFlags(photosSub)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminPanel title="Inspection volume (7 days)" className="min-w-0">
              <div className="h-64 w-full min-h-[256px] min-w-0">
                <ResponsiveContainer width="100%" height={256} minHeight={200}>
                  <AreaChart data={data?.volume7Days || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0033FF" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0033FF" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [value, 'Inspections']}
                    />
                    <Area type="monotone" dataKey="count" stroke="#0033FF" strokeWidth={2} fill="url(#volumeFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>

            <AdminPanel
              title="Top defect categories"
              subtitle="Repair / replace items in the last 7 days"
              className="min-w-0"
            >
              {defectChart.length === 0 ? (
                <p className="text-sm text-slate-500 py-12 text-center">No defect data for this period.</p>
              ) : (
                <div className="h-64 w-full min-h-[256px] min-w-0">
                  <ResponsiveContainer width="100%" height={256} minHeight={200}>
                    <BarChart data={defectChart} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        formatter={(value: number, _n, props) => [
                          value,
                          (props as { payload?: { fullName?: string } }).payload?.fullName || 'Defects',
                        ]}
                      />
                      <Bar dataKey="count" fill="#FF6600" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">
                Pass = no repair/replace items · Review = inspection flagged C, A, R, or RP
              </p>
            </AdminPanel>
          </div>
        </>
      )}
    </div>
  );
}
