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
import {
  Car,
  CheckCircle,
  Search,
  Clock,
  Camera,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

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

function KpiCard({
  title,
  value,
  sub,
  positiveIsGood = true,
  icon: Icon,
}: {
  title: string;
  value: string;
  sub?: string | null;
  positiveIsGood?: boolean;
  icon: LucideIcon;
}) {
  const trendUp = sub?.startsWith('+');
  const trendDown = sub?.startsWith('-');
  const trendGood =
    (trendUp && positiveIsGood) || (trendDown && !positiveIsGood) || sub === '0% vs yesterday';
  const trendBad =
    (trendUp && !positiveIsGood) || (trendDown && positiveIsGood);

  return (
    <div className="bg-[#0033FF] rounded-2xl shadow-lg p-5 sm:p-6 text-white border-2 border-[#0033FF]/50 transform hover:scale-[1.02] transition-transform">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-xs sm:text-sm font-medium text-white/90 leading-tight">{title}</h3>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </div>
      </div>
      <p className="text-3xl sm:text-4xl font-bold tracking-tight">{value}</p>
      {sub ? (
        <p
          className={`mt-2 text-xs sm:text-sm font-medium flex items-center gap-1 ${
            trendGood ? 'text-green-200' : trendBad ? 'text-red-200' : 'text-white/70'
          }`}
        >
          {trendUp && <TrendingUp className="w-3.5 h-3.5 shrink-0" />}
          {trendDown && <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
          {sub}
        </p>
      ) : (
        <p className="mt-2 text-xs text-white/60">No prior day data</p>
      )}
    </div>
  );
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0033FF]" />
            Analytics
          </h2>
          <p className="text-sm text-black/60 mt-1">
            Organisation inspection intelligence — completed inspections only.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col text-xs font-semibold text-black gap-1">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-black bg-white focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF]"
            />
          </label>
          <label className="flex flex-col text-xs font-semibold text-black gap-1">
            Location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-black bg-white min-w-[140px] focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF]"
            >
              {(data?.locations || ['all']).map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'all' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
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
          <span className="text-black font-medium">Loading analytics…</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-black/50 -mt-2">
            Showing data for <span className="font-semibold text-black">{formatDisplayDate(date)}</span>
            {location !== 'all' ? ` · ${location}` : ''}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <KpiCard
              title="Vehicles inspected"
              value={String(k?.vehiclesInspected.value ?? 0)}
              sub={vehiclesSub}
              icon={Car}
            />
            <KpiCard
              title="Pass rate"
              value={`${k?.passRate.value ?? 0}%`}
              sub={passSub}
              icon={CheckCircle}
            />
            <KpiCard
              title="Review rate"
              value={`${k?.reviewRate.value ?? 0}%`}
              sub={reviewSub}
              positiveIsGood={false}
              icon={Search}
            />
            <KpiCard
              title="Avg inspection time"
              value={k?.avgInspectionMinutes.value != null ? `${k.avgInspectionMinutes.value}m` : '—'}
              sub={timeSub}
              icon={Clock}
            />
            <KpiCard
              title="Photos captured"
              value={(k?.photosCaptured.value ?? 0).toLocaleString()}
              sub={photosSub}
              icon={Camera}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30 min-w-0">
              <h3 className="text-lg font-bold text-black mb-4">Inspection volume (7 days)</h3>
              <div className="h-64 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.volume7Days || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0033FF" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#0033FF" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#374151' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#374151' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #0033FF40' }}
                      formatter={(value: number) => [value, 'Inspections']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#0033FF"
                      strokeWidth={2}
                      fill="url(#volumeFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30 min-w-0">
              <h3 className="text-lg font-bold text-black mb-4">Top defect categories</h3>
              <p className="text-xs text-black/50 mb-3">Repair / replace items in the last 7 days</p>
              {defectChart.length === 0 ? (
                <p className="text-sm text-black/50 py-12 text-center">No defect data for this period.</p>
              ) : (
                <div className="h-64 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={defectChart} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#374151' }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 10, fill: '#374151' }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #0033FF40' }}
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
              <p className="text-xs text-[#0033FF] mt-3 font-medium">
                Pass = no repair/replace items · Review = inspection flagged C, A, R, or RP
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
