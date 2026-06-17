import type { VerificationBadge } from '@/lib/inspection-report-data';

const BADGE_ICONS: Record<string, string> = {
  vin: '▥',
  odometer: '◷',
  condition: '⌕',
  accessories: '◆',
  ev: '⚡',
  photos: '◉',
};

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
      const icon = BADGE_ICONS[badge.key] || '✓';
      const statusTone = badge.ok ? 'text-[#FF6600]' : 'text-slate-500';
      return `<div class="report-badge-cell text-center px-1">
        <div class="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0033FF] text-sm font-bold text-[#0033FF]">${icon}</div>
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

export { BADGE_ICONS };
