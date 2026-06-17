'use client';

import type { IInspection } from '@/types/db';
import { computeReportResult } from '@/lib/inspection-report-data';
import {
  buildVehicleDetailColumns,
  getReportResultDisplay,
} from '@/lib/report-vehicle-panel';
import { getVehicleTitle } from '@/lib/inspection-report-data';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="report-detail-row space-y-0.5">
      <span className="report-detail-label block font-bold text-[#0033FF] uppercase text-[10px] leading-tight">
        {label}
      </span>
      <span className="report-detail-value block text-slate-900 text-[11px] leading-snug break-words">
        {value}
      </span>
    </div>
  );
}

type ReportVehicleResultPanelProps = {
  inspection: IInspection;
  heroUrl: string | null;
};

export default function ReportVehicleResultPanel({ inspection, heroUrl }: ReportVehicleResultPanelProps) {
  const result = computeReportResult(inspection);
  const { col1, col2 } = buildVehicleDetailColumns(inspection);
  const display = getReportResultDisplay(result.isPass, result.needsReview);
  const passRing = display.pass ? 'border-[#FF6600] bg-white' : 'border-amber-500 bg-amber-50';
  const passText = display.pass ? 'text-[#FF6600]' : 'text-amber-600';

  const vehicleTitle = getVehicleTitle(inspection);

  return (
    <section className="report-page-1 report-vehicle-result-row grid grid-cols-1 lg:grid-cols-[1fr_minmax(148px,26%)] gap-2.5 p-2.5 border-b border-[var(--report-border)]">
      <div className="report-panel border border-[var(--report-border)] rounded-sm overflow-hidden bg-white flex flex-col min-h-0">
        <div className="report-panel-header bg-[#E8EEFF] px-3 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--report-border)]">
          <span className="text-[10px] font-bold text-[#0033FF] uppercase tracking-wide">
            Vehicle information
          </span>
          <span className="text-[11px] sm:text-sm font-bold text-[#0033FF] text-right">{vehicleTitle}</span>
        </div>
        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 items-start flex-1">
          <div className="relative h-[76px] sm:h-[88px] bg-slate-100 border border-[var(--report-border)] overflow-hidden rounded-sm">
            {heroUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroUrl} alt="Vehicle" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-[10px] text-slate-400 p-1 text-center leading-tight">
                No photo
              </div>
            )}
          </div>
          <div className="report-vehicle-columns grid grid-cols-2 gap-0 min-w-0 divide-x divide-[var(--report-border)]">
            <div className="report-vehicle-col pr-3 space-y-2">
              {col1.map((p) => (
                <DetailRow key={p.label} label={p.label} value={p.value} />
              ))}
            </div>
            <div className="report-vehicle-col pl-3 space-y-2">
              {col2.map((p) => (
                <DetailRow key={p.label} label={p.label} value={p.value} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="report-panel border border-[var(--report-border)] rounded-sm overflow-hidden bg-white flex flex-col min-h-[140px]">
        <div className="report-panel-header bg-[#E8EEFF] px-3 py-2 border-b border-[var(--report-border)]">
          <span className="text-[10px] font-bold text-[#0033FF] uppercase tracking-wide">
            Pre-delivery result
          </span>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center px-3 py-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center shrink-0 ${passRing}`}
              >
                {display.pass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
                    <path
                      d="M8 12.5l2.5 2.5L16 9"
                      stroke="#FF6600"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
                    <path d="M12 9v4M12 16h.01" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${passText}`}>
                {display.label}
              </span>
            </div>
          </div>
          <p className="text-[9px] font-medium text-[#0033FF] text-center leading-snug px-3 pb-3">
            {display.summary}
          </p>
        </div>
      </div>
    </section>
  );
}
