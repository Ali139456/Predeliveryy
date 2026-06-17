import type { VerificationBadge } from '@/lib/inspection-report-data';
import { badgeIconSvg } from '@/lib/report-badge-icons';

export default function ReportVerificationBadges({ badges }: { badges: VerificationBadge[] }) {
  return (
    <section className="report-section-tight border-b border-[var(--report-border)] bg-[#f7f9ff]">
      <h3 className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#0033FF]">
        Vehicle badges
      </h3>
      <div className="report-badges-grid grid grid-cols-3 gap-y-3 sm:grid-cols-6">
        {badges.map((badge) => {
          const statusTone = badge.ok ? 'text-[#FF6600]' : 'text-slate-500';
          const svg = badgeIconSvg(badge.key);
          return (
            <div key={badge.key} className="report-badge-cell text-center px-1">
              <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0033FF] bg-white">
                <span
                  className="report-badge-icon inline-flex h-6 w-6 items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
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
