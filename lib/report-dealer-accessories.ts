import type { IInspection } from '@/types/db';
import { getSelectedDealerAccessoryLabels } from '@/lib/dealer-accessories';
import { findChecklistItem } from '@/lib/verification-badge-evidence';
import { reportItemStatusLabel } from '@/lib/checklist-template';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function dealerAccessoriesSectionHtml(inspection: IInspection): string {
  const labels = getSelectedDealerAccessoryLabels(inspection.dealerAccessoriesFitted);
  const qcItem = findChecklistItem(inspection, /dealer-fitted accessories/i);

  const listHtml =
    labels.length > 0
      ? `<ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-800">${labels
          .map(
            (label) =>
              `<li class="flex items-center gap-2 rounded-sm border border-[var(--report-border)] bg-white px-2.5 py-1.5"><span class="text-[#FF6600] font-bold" aria-hidden="true">✓</span><span>${esc(label)}</span></li>`
          )
          .join('')}</ul>`
      : '<p class="text-[10px] text-slate-600">None recorded on this inspection.</p>';

  const qcHtml = qcItem
    ? `<p class="mt-2 text-[9px] text-slate-600 leading-snug">Final QC — ${esc(qcItem.item)}: <span class="font-semibold text-slate-800">${esc(reportItemStatusLabel(qcItem.status))}</span>${qcItem.notes?.trim() ? ` — ${esc(qcItem.notes.trim())}` : ''}</p>`
    : '';

  return `<section id="report-accessories" class="report-section-tight border-b border-[var(--report-border)] scroll-mt-24">
    <h3 class="text-[11px] font-bold text-[#0033FF] uppercase mb-2 tracking-wide">Dealer accessories fitted</h3>
    ${listHtml}
    ${qcHtml}
  </section>`;
}
