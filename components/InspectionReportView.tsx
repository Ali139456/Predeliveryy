'use client';

import type { IInspection } from '@/types/db';
import {
  buildReportNotes,
  buildVerificationBadges,
  collectReportPhotos,
  formatReportDateTime,
  getHeroPhotoUrl,
  orderChecklistForReport,
  reportCategorySummary,
  reportItemStatusLabel,
} from '@/lib/inspection-report-data';
import ReportVerificationBadges from '@/components/report/ReportVerificationBadges';
import ReportVehicleResultPanel from '@/components/report/ReportVehicleResultPanel';
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

export default function InspectionReportView({ inspection }: InspectionReportViewProps) {
  const photos = collectReportPhotos(inspection);
  const heroUrl = getHeroPhotoUrl(inspection);
  const notes = buildReportNotes(inspection);

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

        <ReportVehicleResultPanel inspection={inspection} heroUrl={heroUrl} />

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
