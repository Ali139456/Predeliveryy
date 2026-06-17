import type { VerificationBadge } from '@/lib/inspection-report-data';
import { BADGE_ICONS } from '@/lib/report-verification-badges';

export default function ReportVerificationBadges({ badges }: { badges: VerificationBadge[] }) {
  return (
    <section className="report-section-tight border-b border-[var(--report-border)] bg-[#f7f9ff]">
      <h3 className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#0033FF]">
        Vehicle badges
      </h3>
      <div className="report-badges-grid grid grid-cols-3 gap-y-3 sm:grid-cols-6">
        {badges.map((badge) => {
          const icon = BADGE_ICONS[badge.key] || '✓';
          const statusTone = badge.ok ? 'text-[#FF6600]' : 'text-slate-500';
          return (
            <div key={badge.key} className="report-badge-cell text-center px-1">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0033FF] text-sm font-bold text-[#0033FF]">
                {icon}
              </div>
              <p className="text-[8px] font-bold uppercase leading-tight text-[#0033FF]">{badge.label}</p>
              <p className={`text-[8px] font-bold uppercase leading-tight ${statusTone}`}>{badge.status}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
