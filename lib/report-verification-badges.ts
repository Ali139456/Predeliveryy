import type { VerificationBadge } from '@/lib/inspection-report-data';
import { badgeIconHtml } from '@/lib/report-badge-icons';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function verificationBadgesHtml(badges: VerificationBadge[]): string {
  const cells = badges
    .map((badge) => {
      const statusTone = badge.ok ? 'text-[#FF6600]' : 'text-slate-500';
      return `<div class="report-badge-cell text-center px-1">
        <div class="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0033FF] bg-white">${badgeIconHtml(badge.key)}</div>
        <p class="text-[8px] font-bold uppercase leading-tight text-[#0033FF]">${esc(badge.label)}</p>
        <p class="text-[8px] font-bold uppercase leading-tight ${statusTone}">${esc(badge.status)}</p>
      </div>`;
    })
    .join('');

  return `<section class="report-section-tight border-b border-[var(--report-border)] bg-[#f7f9ff]">
    <h3 class="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#0033FF]">Vehicle badges</h3>
    <div class="report-badges-grid grid grid-cols-3 gap-y-3 sm:grid-cols-6">${cells}</div>
  </section>`;
}

export { badgeIconHtml } from '@/lib/report-badge-icons';
