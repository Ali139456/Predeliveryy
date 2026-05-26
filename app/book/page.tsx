'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CheckCircle2, ClipboardCheck, Loader2, Stamp, Wrench } from 'lucide-react';

const INSPECTION_OPTIONS = [
  {
    value: 'pdi',
    label: 'Pre-Delivery Inspection',
    blurb: 'New vehicle handover check for dealers, OEMs and fleets.',
    Icon: ClipboardCheck,
    accent: 'border-[#FF6600]',
    iconBg: 'bg-[#FF6600]',
    iconText: 'text-[#FF6600]',
    badge: 'PDI',
  },
  {
    value: 'blue_slip',
    label: 'Blue Slip (NSW AUVIS)',
    blurb: 'Identity + comprehensive safety for unregistered or imported vehicles.',
    Icon: Stamp,
    accent: 'border-[#0033FF]',
    iconBg: 'bg-[#0033FF]',
    iconText: 'text-[#0033FF]',
    badge: 'NSW AUVIS',
  },
  {
    value: 'pink_slip',
    label: 'Pink Slip (NSW eSafety)',
    blurb: 'Annual safety check for light vehicles over 5 years old.',
    Icon: Wrench,
    accent: 'border-[#EC4899]',
    iconBg: 'bg-[#EC4899]',
    iconText: 'text-[#EC4899]',
    badge: 'NSW eSafety',
  },
] as const;

type InspectionValue = (typeof INSPECTION_OPTIONS)[number]['value'];

function BookFormInner() {
  const params = useSearchParams();
  const initialType = (params.get('type') || 'pdi') as InspectionValue;

  const [inspectionType, setInspectionType] = useState<InspectionValue>(
    INSPECTION_OPTIONS.some((o) => o.value === initialType) ? initialType : 'pdi'
  );
  // Submit button colour follows the active inspection type so the CTA
  // reads as a continuation of the picked card.
  const submitColour = {
    pdi: { bg: 'bg-[#FF6600]', hover: 'hover:bg-[#E65C00]' },
    blue_slip: { bg: 'bg-[#0033FF]', hover: 'hover:bg-[#0029CC]' },
    pink_slip: { bg: 'bg-[#EC4899]', hover: 'hover:bg-[#DB2777]' },
  }[inspectionType];
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleRego, setVehicleRego] = useState('');
  const [vehicleVin, setVehicleVin] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionType,
          customerName,
          customerEmail,
          customerPhone,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleRego,
          vehicleVin,
          preferredDate,
          preferredTimeSlot,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Booking failed. Please try again.');
      }
      setSuccess(data.message || 'Booking received. Our team will be in touch shortly.');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setVehicleMake('');
      setVehicleModel('');
      setVehicleYear('');
      setVehicleRego('');
      setVehicleVin('');
      setPreferredDate('');
      setPreferredTimeSlot('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block mb-4 text-[#0033FF] font-bold text-xs uppercase tracking-wider px-3 py-1.5 bg-[#0033FF]/10 rounded-full border border-[#0033FF]/20">
              Book an inspection
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
              Reserve your inspection slot
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tell us about your vehicle and preferred time. Our team will confirm by email or phone within one business day.
            </p>
          </div>

          {/* Type picker cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {INSPECTION_OPTIONS.map((opt) => {
              const Icon = opt.Icon;
              const active = inspectionType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInspectionType(opt.value)}
                  className={`text-left rounded-2xl p-4 bg-white transition-all border-2 ${
                    active ? `${opt.accent} shadow-lg` : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? `${opt.iconBg} text-white` : 'bg-gray-100 text-gray-700'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {active && <CheckCircle2 className={`w-5 h-5 ${opt.iconText}`} />}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{opt.badge}</p>
                  <p className="font-semibold text-gray-900 leading-tight">{opt.label}</p>
                  <p className="text-xs text-gray-600 mt-1.5">{opt.blurb}</p>
                </button>
              );
            })}
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  maxLength={320}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={32}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                />
              </Field>
              <Field label="Preferred date">
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                />
              </Field>
              <Field label="Vehicle make">
                <input
                  type="text"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  maxLength={80}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                  placeholder="e.g. Toyota"
                />
              </Field>
              <Field label="Vehicle model">
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  maxLength={80}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                  placeholder="e.g. Hilux"
                />
              </Field>
              <Field label="Year">
                <input
                  type="text"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  maxLength={8}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
                  placeholder="e.g. 2021"
                />
              </Field>
              <Field label="Time slot">
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] bg-white text-gray-900"
                >
                  <option value="">Anytime</option>
                  <option value="morning">Morning (8am – 12pm)</option>
                  <option value="afternoon">Afternoon (12pm – 5pm)</option>
                </select>
              </Field>
              <Field label="Registration (rego)">
                <input
                  type="text"
                  value={vehicleRego}
                  onChange={(e) => setVehicleRego(e.target.value.toUpperCase())}
                  maxLength={16}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] uppercase text-gray-900"
                />
              </Field>
              <Field label="VIN (optional)">
                <input
                  type="text"
                  value={vehicleVin}
                  onChange={(e) => setVehicleVin(e.target.value.toUpperCase())}
                  maxLength={32}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] uppercase text-gray-900"
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Anything we should know (e.g. modifications, defects, location)"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0033FF]/25 focus:border-[#0033FF] text-gray-900"
              />
            </Field>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
              <p className="text-xs text-gray-500">
                By submitting you agree to be contacted about this inspection request.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${submitColour.bg} ${submitColour.hover} text-white font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Submit booking
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/" className="text-[#0033FF] font-semibold hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-[#FF6600] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-[#0033FF] animate-spin" />
      </div>
    }>
      <BookFormInner />
    </Suspense>
  );
}
