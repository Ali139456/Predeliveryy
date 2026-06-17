'use client';

import type { IInspection } from '@/types/db';
import {
  buildReportNotes,
  buildVerificationBadges,
  collectReportPhotos,
  computeReportResult,
  extractLocationLabel,
  formatReportDateTime,
  formatValue,
  getHeroPhotoUrl,
  getVehicleTitle,
  orderChecklistForReport,
  reportCategorySummary,
  reportItemStatusLabel,
} from '@/lib/inspection-report-data';
import ReportVerificationBadges from '@/components/report/ReportVerificationBadges';
import {
  Calendar,
  ClipboardList,
  Mail,
} from 'lucide-react';
import { SITE_LOGO_ALT, SITE_LOGO_REPORT_SRC } from '@/lib/siteLogo';
import './inspection-report.css';

interface InspectionReportViewProps {
  inspection: IInspection;
}

function VehicleDetailCell({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="font-bold text-[#0033FF] uppercase text-[10px] leading-tight pt-0.5">{label}</span>
      <span className="text-slate-900 text-[11px] leading-snug min-w-0">{value}</span>
    </>
  );
}

export default function InspectionReportView({ inspection }: InspectionReportViewProps) {
  const result = computeReportResult(inspection);
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
  const checklistCategories = orderChecklistForReport(inspection.checklist || []);
  const verificationBadges = buildVerificationBadges(inspection);

  return (
    <div className="inspection-report-root w-full py-0">
      <article className="inspection-report-sheet overflow-hidden rounded-sm border border-slate-200">
        {/* Header */}
        <header
          className="report-page-1 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-center px-3 py-2.5 text-white"
          style={{ background: 'linear-gradient(180deg, #002060 0%, #0033ff 100%)' }}
        >
          <div className="shrink-0 w-fit max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_LOGO_REPORT_SRC}
              alt={SITE_LOGO_ALT}
              className="h-14 sm:h-[4.25rem] w-auto max-w-[min(100%,280px)] object-contain object-left block"
            />
            <p className="mt-1 text-[9px] text-white/75 tracking-wide">Verified before your drive.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] md:text-xs md:justify-end">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6600] shrink-0" aria-hidden />
              <div>
                <p className="text-white/70 text-[9px] uppercase tracking-wider">Inspection date</p>
                <p className="font-semibold">{formatReportDateTime(inspection.inspectionDate || inspection.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#FF6600] shrink-0" aria-hidden />
              <div>
                <p className="text-white/70 text-[9px] uppercase tracking-wider">Report ID</p>
                <p className="font-semibold">{inspection.inspectionNumber || inspection.id}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Vehicle + result */}
        <section className="report-page-1 grid grid-cols-1 lg:grid-cols-[1fr_130px] gap-0 border-b border-[var(--report-border)]">
          <div className="p-2.5 border-b lg:border-b-0 lg:border-r border-[var(--report-border)]">
            <div className="flex items-center justify-between gap-2 mb-2 border-b border-[var(--report-border)] pb-2">
              <span className="text-[10px] font-bold text-[#0033FF] uppercase tracking-wide">
                Vehicle information
              </span>
              <span className="text-sm font-bold text-[#0033FF] text-center flex-1 px-2">{vehicleTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
              <div className="relative h-[72px] sm:h-[80px] bg-slate-100 border border-[var(--report-border)] overflow-hidden rounded-sm">
                {heroUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroUrl} alt="Vehicle" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-[10px] text-slate-400 p-1 text-center leading-tight">
                    No photo
                  </div>
                )}
              </div>
              <div className="report-vehicle-details grid grid-cols-[minmax(5.75rem,8rem)_minmax(0,1fr)] gap-x-5 gap-y-1.5 min-w-0 content-start">
                <VehicleDetailCell label="VIN" value={formatValue(v?.vin)} />
                <VehicleDetailCell label="Odometer" value={formatValue(v?.odometer)} />
                <VehicleDetailCell label="Engine" value={formatValue(v?.engine)} />
                <VehicleDetailCell label="Registration" value={formatValue(v?.licensePlate)} />
                <VehicleDetailCell label="Dealer" value={formatValue(v?.dealer)} />
                <VehicleDetailCell label="Stock No." value={formatValue(v?.dealerStockNo)} />
                <VehicleDetailCell label="Inspection type" value="Pre-Delivery Inspection" />
                <VehicleDetailCell label="Location" value={extractLocationLabel(inspection.location)} />
                <VehicleDetailCell label="Start time" value={formatReportDateTime(startTime)} />
                <VehicleDetailCell label="Technician" value={formatValue(inspection.inspectorName)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 bg-slate-50/80 text-center lg:border-l border-[var(--report-border)]">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#0033FF] mb-1">
              Pre-delivery result
            </p>
            <div
              className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center mb-1 ${
                result.isPass ? 'border-[#FF6600] bg-white' : 'border-amber-500 bg-amber-50'
              }`}
            >
              <span
                className={`text-lg font-black ${result.isPass ? 'text-[#FF6600]' : 'text-amber-600'}`}
              >
                {result.isPass ? '✓' : '!'}
              </span>
            </div>
            <p
              className={`text-xl font-black tracking-tight leading-none ${result.isPass ? 'text-[#FF6600]' : 'text-amber-600'}`}
            >
              {result.isPass ? 'PASS' : result.needsReview ? 'REVIEW' : 'ATTENTION'}
            </p>
            <p className="text-[8px] text-slate-600 mt-1 leading-snug px-1">
              {result.isPass
                ? 'Vehicle has passed all required pre-delivery inspection checks.'
                : 'Repair or review required.'}
            </p>
          </div>
        </section>

        <ReportVerificationBadges badges={verificationBadges} />

        {/* Checklist */}
        <section className="report-section-tight border-b border-[var(--report-border)]">
          <h3 className="text-[11px] font-bold text-[#0033FF] uppercase mb-2 tracking-wide">
            Inspection categories
          </h3>
          <div className="report-checklist-grid">
            {checklistCategories.map((cat) => {
              const summary = reportCategorySummary(cat);
              const countLabel =
                summary.total > 0 ? `${summary.passed} / ${summary.total} checks` : 'No checks';
              return (
                <div
                  key={cat.category}
                  className="report-checklist-category border border-[var(--report-border)] rounded-sm overflow-hidden bg-white"
                >
                  <div className="bg-[#0033FF] text-white text-[10px] font-bold uppercase px-2 py-1.5 text-center">
                    {cat.category}
                  </div>
                  <ul className="text-[9px]">
                    {(cat.items || []).map((item, idx) => {
                      const label = reportItemStatusLabel(item.status);
                      const tone =
                        label === 'PASS'
                          ? 'text-[#FF6600]'
                          : label === 'N/A'
                            ? 'text-slate-500'
                            : 'text-amber-700';
                      return (
                        <li
                          key={`${item.item}-${idx}`}
                          className={`flex justify-between gap-1 px-2 py-1 border-b border-slate-100 last:border-0 ${
                            idx % 2 === 1 ? 'bg-[var(--report-row-alt)]' : 'bg-white'
                          }`}
                        >
                          <span className="text-slate-800 leading-tight pr-1">{item.item}</span>
                          <span className={`font-bold shrink-0 ${tone}`}>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="border-t border-[var(--report-border)] bg-slate-50 px-2 py-1 text-center text-[8px] font-bold uppercase tracking-wide text-[#0033FF]">
                    {countLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Photos */}
        <section className="report-section-tight border-b border-[var(--report-border)]">
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
                  <p className="text-[9px] font-bold text-[#0033FF] text-center mt-0.5 leading-tight line-clamp-2">
                    {p.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2.5 text-[10px]">
          <div className="border border-[var(--report-border)] rounded-sm p-2 bg-slate-50/50">
            <p className="font-bold text-[#0033FF] uppercase mb-1">Notes</p>
            <p className="text-slate-700 leading-snug">{notes}</p>
          </div>
          <div className="border border-[var(--report-border)] rounded-sm p-2 flex flex-col items-center justify-center">
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
          <div className="border border-[var(--report-border)] rounded-sm p-2 flex flex-col items-center justify-center">
            <Mail className="w-5 h-5 text-[#0033FF] mb-1" aria-hidden />
            <p className="font-bold text-[#0033FF]">info@predelivery.ai</p>
          </div>
        </footer>

        <p className="text-[7px] text-slate-500 px-3 pb-3 leading-tight text-center whitespace-normal">
          DISCLAIMER: This report is based on a visual and non-invasive inspection at the time and location noted above. It does not guarantee future performance or condition of the vehicle. Refer to full terms at predelivery.ai/terms.
        </p>
      </article>
    </div>
  );
}
