'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, ClipboardCheck, Loader2, RefreshCw, Stamp, Trash2, Wrench } from 'lucide-react';
import {
  AdminPanel,
  AdminPageHeader,
  AdminTable,
  AdminThead,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminStatusBadge,
} from '@/components/admin/AdminUI';

type Booking = {
  id: string;
  inspection_type: 'pdi' | 'blue_slip' | 'pink_slip';
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: string | null;
  vehicle_rego: string | null;
  vehicle_vin: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  inspection_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS: Array<{ value: Booking['status']; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function typeMeta(t: Booking['inspection_type']) {
  if (t === 'blue_slip') return { label: 'Blue Slip', Icon: Stamp, color: 'text-[#0033FF]' };
  if (t === 'pink_slip') return { label: 'Pink Slip', Icon: Wrench, color: 'text-[#EC4899]' };
  return { label: 'PDI', Icon: ClipboardCheck, color: 'text-[#FF6600]' };
}


export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | Booking['status']>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? `/api/admin/bookings?status=${encodeURIComponent(statusFilter)}`
        : '/api/admin/bookings';
      const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: Booking['status']) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed');
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteBooking = async (b: Booking) => {
    const label = `${b.customer_name || b.customer_email || 'this booking'}`;
    if (!window.confirm(`Delete booking from ${label}? This cannot be undone.`)) return;
    setDeletingId(b.id);
    try {
      const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(b.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
      setBookings((prev) => prev.filter((row) => row.id !== b.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  const counts = useMemo(() => {
    const acc: Record<Booking['status'], number> = {
      new: 0,
      contacted: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
    });
    return acc;
  }, [bookings]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={Calendar}
        title="Inspection bookings"
        subtitle="Customer requests submitted from the website. Update each booking as you follow up and convert it into an inspection."
        actions={
          <button
            type="button"
            onClick={() => void fetchBookings()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            statusFilter === ''
              ? 'bg-[#0033FF] text-white border-[#0033FF]'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({bookings.length})
        </button>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              statusFilter === opt.value
                ? 'bg-[#0033FF] text-white border-[#0033FF]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {opt.label} ({counts[opt.value] ?? 0})
          </button>
        ))}
      </div>

      <AdminPanel>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm p-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading bookings…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3 m-4">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <AdminTable>
              <AdminThead>
                <AdminTh>Type</AdminTh>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Vehicle</AdminTh>
                <AdminTh>Preferred</AdminTh>
                <AdminTh>Submitted</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Actions</AdminTh>
              </AdminThead>
              <tbody>
                {bookings.map((b) => {
                  const tm = typeMeta(b.inspection_type);
                  const Icon = tm.Icon;
                  const vehicle = [b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—';
                  const idShort = b.id.slice(0, 8);
                  return (
                    <AdminTr key={b.id}>
                      <AdminTd>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${tm.color}`} />
                          <div>
                            <div className="font-semibold text-slate-900">{tm.label}</div>
                            <div className="text-[11px] text-slate-400">#{idShort}</div>
                          </div>
                        </div>
                      </AdminTd>
                      <AdminTd>
                        <div className="font-medium text-slate-900">{b.customer_name}</div>
                        <a
                          href={`mailto:${b.customer_email}`}
                          className="text-xs text-[#0033FF] hover:underline break-all"
                        >
                          {b.customer_email}
                        </a>
                        {b.customer_phone && (
                          <div className="text-xs text-slate-500 mt-0.5">{b.customer_phone}</div>
                        )}
                      </AdminTd>
                      <AdminTd>
                        <div className="text-slate-900">{vehicle}</div>
                        {b.vehicle_rego && (
                          <div className="text-xs text-slate-500 mt-0.5">Rego: {b.vehicle_rego}</div>
                        )}
                        {b.vehicle_vin && (
                          <div className="text-xs text-slate-500">VIN: {b.vehicle_vin}</div>
                        )}
                      </AdminTd>
                      <AdminTd>
                        <div className="text-slate-900">{b.preferred_date || '—'}</div>
                        <div className="text-xs text-slate-500">{b.preferred_time_slot || ''}</div>
                      </AdminTd>
                      <AdminTd>
                        <div className="text-xs text-slate-500">{new Date(b.created_at).toLocaleString()}</div>
                      </AdminTd>
                      <AdminTd>
                        <div className="flex items-center gap-2">
                          <AdminStatusBadge status={b.status} />
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) =>
                              void updateStatus(b.id, e.target.value as Booking['status'])
                            }
                            className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 focus:ring-2 focus:ring-[#0033FF]/20 focus:border-[#0033FF] disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </AdminTd>
                      <AdminTd>
                        <button
                          type="button"
                          onClick={() => void deleteBooking(b)}
                          disabled={deletingId === b.id || updatingId === b.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                          aria-label={`Delete booking from ${b.customer_name || b.customer_email}`}
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </button>
                      </AdminTd>
                    </AdminTr>
                  );
                })}
              </tbody>
            </AdminTable>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
