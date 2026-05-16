'use client';

import type { IInspection } from '@/types/db';
import {
  buildReportNotes,
  buildVerificationBadges,
  categorySummary,
  collectReportPhotos,
  computeReportResult,
  extractLocationLabel,
  formatReportDateTime,
  formatValue,
  getHeroPhotoUrl,
  getVehicleTitle,
  itemStatusLabel,
} from '@/lib/inspection-report-data';
import {
  Calendar,
  ClipboardList,
  Mail,
} from 'lucide-react';
import './inspection-report.css';

interface InspectionReportViewProps {
  inspection: IInspection;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[11px] leading-snug">
      <span className="font-bold text-[#0033FF] shrink-0 min-w-[5.5rem]">{label}</span>
      <span className="text-slate-900 break-words">{value}</span>
    </div>
  );
}

export default function InspectionReportView({ inspection }: InspectionReportViewProps) {
  const result = computeReportResult(inspection);
  const badges = buildVerificationBadges(inspection);
  const photos = collectReportPhotos(inspection);
  const heroUrl = getHeroPhotoUrl(inspection);
  const notes = buildReportNotes(inspection);
  const v = inspection.vehicleInfo;
  const vehicleTitle = getVehicleTitle(inspection);
  const startTime =
    (inspection.location as { start?: { timestamp?: string } })?.start?.timestamp ||
    inspection.inspectionDate ||
    inspection.createdAt;

  const technicianSig = inspection.signatures?.technician;

  return (
    <div className="inspection-report-root w-full py-2">
      <article className="inspection-report-sheet overflow-hidden rounded-sm border border-slate-200">
        {/* Header */}
        <header
          className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 text-white"
          style={{ background: 'linear-gradient(180deg, #002060 0%, #0033ff 100%)' }}
        >
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[#FF6600] font-black text-2xl tracking-tight">PD</span>
              <span className="font-bold text-lg tracking-wide">PRE DELIVERY</span>
            </div>
            <p className="text-[10px] text-white/80 mt-0.5">Verified before your drive</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] md:text-xs">
            <Calendar className="w-4 h-4 text-[#FF6600] shrink-0" aria-hidden />
            <div>
              <p className="text-white/70 text-[9px] uppercase tracking-wider">Inspection date</p>
              <p className="font-semibold">{formatReportDateTime(inspection.inspectionDate || inspection.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] md:text-xs">
            <ClipboardList className="w-4 h-4 text-[#FF6600] shrink-0" aria-hidden />
            <div>
              <p className="text-white/70 text-[9px] uppercase tracking-wider">Report ID</p>
              <p className="font-semibold">{inspection.inspectionNumber || inspection.id}</p>
            </div>
          </div>
        </header>

        {/* Vehicle + result */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-0 border-b border-[var(--report-border)]">
          <div className="p-3 border-b lg:border-b-0 lg:border-r border-[var(--report-border)]">
            <div className="flex items-center justify-between gap-2 mb-2 border-b border-[var(--report-border)] pb-2">
              <span className="text-[10px] font-bold text-[#0033FF] uppercase tracking-wide">
                Vehicle information
              </span>
              <span className="text-sm font-bold text-[#0033FF] text-center flex-1 px-2">{vehicleTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
              <div className="relative aspect-[4/3] bg-slate-100 border border-[var(--report-border)] overflow-hidden rounded-sm">
                {heroUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroUrl} alt="Vehicle" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 p-2 text-center">
                    No vehicle photo
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 content-start">
                <DetailRow label="VIN" value={formatValue(v?.vin)} />
                <DetailRow label="Odometer" value={formatValue(v?.odometer)} />
                <DetailRow label="Engine" value={formatValue(v?.engine)} />
                <DetailRow label="Registration" value={formatValue(v?.licensePlate)} />
                <DetailRow label="Dealer" value={formatValue(v?.dealer)} />
                <DetailRow label="Stock No." value={formatValue(v?.dealerStockNo)} />
                <DetailRow label="Inspection type" value="Pre-Delivery Inspection" />
                <DetailRow label="Location" value={extractLocationLabel(inspection.location)} />
                <DetailRow label="Start time" value={formatReportDateTime(startTime)} />
                <DetailRow label="Technician" value={formatValue(inspection.inspectorName)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 text-center min-h-[180px]">
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-2 ${
                result.isPass ? 'border-[#FF6600] bg-white' : 'border-amber-500 bg-amber-50'
              }`}
            >
              <span
                className={`text-2xl font-black ${result.isPass ? 'text-[#FF6600]' : 'text-amber-600'}`}
              >
                {result.isPass ? '✓' : '!'}
              </span>
            </div>
            <p
              className={`text-3xl font-black tracking-tight ${result.isPass ? 'text-[#FF6600]' : 'text-amber-600'}`}
            >
              {result.isPass ? 'PASS' : result.needsReview ? 'REVIEW' : 'ATTENTION'}
            </p>
            <p className="text-[10px] text-slate-600 mt-2 max-w-[160px] leading-snug">
              {result.isPass
                ? 'Vehicle has passed all required pre-delivery inspection checks.'
                : 'One or more items require repair or further review before delivery.'}
            </p>
          </div>
        </section>

        {/* Verification badges */}
        <section className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-3 py-3 border-b border-[var(--report-border)] bg-white">
          {badges.map((b) => (
            <div key={b.key} className="flex flex-col items-center text-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-[9px] font-bold text-white mb-1 ${
                  b.ok ? 'bg-[#0033FF]' : 'bg-slate-400'
                }`}
              >
                {b.label.split(' ')[0].slice(0, 3).toUpperCase()}
              </div>
              <span className="text-[9px] font-bold text-[#0033FF] uppercase leading-tight">{b.label}</span>
              <span className={`text-[9px] font-bold ${b.ok ? 'text-[#FF6600]' : 'text-slate-500'}`}>
                {b.status}
              </span>
            </div>
          ))}
        </section>

        {/* Checklist grid */}
        <section className="px-3 py-3 border-b border-[var(--report-border)]">
          <div className="report-checklist-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {(inspection.checklist || []).map((cat) => {
              const summary = categorySummary(cat);
              return (
                <div
                  key={cat.category}
                  className="border border-[var(--report-border)] rounded-sm overflow-hidden bg-white"
                >
                  <div className="bg-[#0033FF] text-white text-[10px] font-bold uppercase px-2 py-1.5 text-center">
                    {cat.category}
                  </div>
                  <ul className="text-[9px]">
                    {(cat.items || []).map((item, idx) => {
                      const label = itemStatusLabel(item.status);
                      const pass = label === 'PASS';
                      return (
                        <li
                          key={`${item.item}-${idx}`}
                          className={`flex justify-between gap-1 px-2 py-1 border-b border-slate-100 last:border-0 ${
                            idx % 2 === 1 ? 'bg-[var(--report-row-alt)]' : 'bg-white'
                          }`}
                        >
                          <span className="text-slate-800 leading-tight pr-1">{item.item}</span>
                          <span
                            className={`font-bold shrink-0 ${
                              pass ? 'text-[#FF6600]' : 'text-amber-700'
                            }`}
                          >
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex justify-between items-center px-2 py-1 bg-slate-50 border-t border-[var(--report-border)] text-[9px]">
                    <span className="font-semibold text-slate-600">
                      {summary.passed} / {summary.total} checks
                    </span>
                    <span
                      className={`font-bold ${summary.categoryPass ? 'text-[#FF6600]' : 'text-amber-700'}`}
                    >
                      {summary.categoryPass ? 'PASS' : 'REVIEW'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Photos */}
        <section className="px-3 py-3 border-b border-[var(--report-border)]">
          <h3 className="text-[11px] font-bold text-[#0033FF] uppercase mb-2">
            Inspection photos ({photos.length})
          </h3>
          {photos.length === 0 ? (
            <p className="text-xs text-slate-500">No photos attached to this inspection.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {photos.map((p, i) => (
                <div key={`${p.url}-${i}`} className="report-photo-cell">
                  <div className="aspect-square border border-[var(--report-border)] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[8px] font-semibold text-[#0033FF] text-center mt-0.5 leading-tight line-clamp-2">
                    {p.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 text-[10px]">
          <div className="border border-[var(--report-border)] rounded-sm p-2 bg-slate-50/50 min-h-[72px]">
            <p className="font-bold text-[#0033FF] uppercase mb-1">Notes</p>
            <p className="text-slate-700 leading-snug">{notes}</p>
          </div>
          <div className="border border-[var(--report-border)] rounded-sm p-2 flex flex-col items-center justify-center min-h-[72px]">
            <p className="font-bold text-[#0033FF] uppercase mb-1 w-full text-left">Technician signature</p>
            {technicianSig ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={technicianSig} alt="Signature" className="max-h-14 w-full object-contain" />
            ) : (
              <p className="text-slate-400 italic">Not provided</p>
            )}
            <p className="text-[9px] text-slate-500 mt-1 w-full text-center">
              {formatReportDateTime(inspection.updatedAt || inspection.createdAt)}
            </p>
          </div>
          <div className="border border-[var(--report-border)] rounded-sm p-2 flex flex-col items-center justify-center min-h-[72px]">
            <Mail className="w-5 h-5 text-[#0033FF] mb-1" aria-hidden />
            <p className="font-bold text-[#0033FF]">info@predelivery.ai</p>
          </div>
        </footer>

        <p className="text-[7px] text-slate-500 px-3 pb-3 leading-relaxed text-center">
          This report is generated from a digital pre-delivery inspection. It is intended for dealer and customer
          reference only and does not replace manufacturer warranty or statutory rights.
        </p>
      </article>
    </div>
  );
}
