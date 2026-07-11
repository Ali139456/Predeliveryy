'use client';

import type { IInspection } from '@/types/db';
import { getSelectedDealerAccessoryLabels } from '@/lib/dealer-accessories';
import { findChecklistItem } from '@/lib/verification-badge-evidence';
import { reportItemStatusLabel } from '@/lib/checklist-template';

export default function ReportDealerAccessoriesSection({ inspection }: { inspection: IInspection }) {
  const labels = getSelectedDealerAccessoryLabels(inspection.dealerAccessoriesFitted);
  const qcItem = findChecklistItem(inspection, /dealer-fitted accessories/i);

  return (
    <section
      id="report-accessories"
      className="report-section-tight border-b border-[var(--report-border)] scroll-mt-24"
    >
      <h3 className="text-[11px] font-bold text-[#0033FF] uppercase mb-2 tracking-wide">
        Dealer accessories fitted
      </h3>
      {labels.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-800">
          {labels.map((label) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-sm border border-[var(--report-border)] bg-white px-2.5 py-1.5"
            >
              <span className="text-[#FF6600] font-bold" aria-hidden>
                ✓
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[10px] text-slate-600">None recorded on this inspection.</p>
      )}
      {qcItem ? (
        <p className="mt-2 text-[9px] text-slate-600 leading-snug">
          Final QC — {qcItem.item}:{' '}
          <span className="font-semibold text-slate-800">{reportItemStatusLabel(qcItem.status)}</span>
          {qcItem.notes?.trim() ? ` — ${qcItem.notes.trim()}` : ''}
        </p>
      ) : null}
    </section>
  );
}
