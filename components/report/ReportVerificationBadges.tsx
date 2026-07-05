'use client';

import { useCallback, useState } from 'react';
import type { VerificationBadge } from '@/lib/inspection-report-data';
import { badgeIconSvg } from '@/lib/report-badge-icons';

function flashTarget(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('report-badge-target-flash');
  window.setTimeout(() => el.classList.remove('report-badge-target-flash'), 1800);
}

export default function ReportVerificationBadges({ badges }: { badges: VerificationBadge[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeBadge = badges.find((b) => b.key === activeKey) ?? null;

  const onBadgeClick = useCallback((badge: VerificationBadge) => {
    setActiveKey((prev) => (prev === badge.key ? null : badge.key));
    flashTarget(badge.anchorId);
  }, []);

  return (
    <section className="report-section-tight border-b border-[var(--report-border)] bg-[#f7f9ff]">
      <h3 className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#0033FF]">
        Vehicle badges
      </h3>
      <p className="mb-2 text-center text-[8px] text-slate-500">Tap a badge to view verification data</p>
      <div className="report-badges-grid grid grid-cols-3 gap-y-3 sm:grid-cols-6">
        {badges.map((badge) => {
          const statusTone = badge.ok ? 'text-[#FF6600]' : 'text-slate-500';
          const svg = badgeIconSvg(badge.key);
          const isActive = activeKey === badge.key;
          return (
            <button
              key={badge.key}
              type="button"
              onClick={() => onBadgeClick(badge)}
              className={`report-badge-cell text-center px-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0033FF] ${
                isActive ? 'bg-white/80 ring-1 ring-[#0033FF]/30' : 'hover:bg-white/60'
              }`}
              aria-expanded={isActive}
              aria-controls={isActive ? `report-badge-detail-${badge.key}` : undefined}
            >
              <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0033FF] bg-white">
                <span
                  className="report-badge-icon inline-flex h-6 w-6 items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>
              <p className="text-[8px] font-bold uppercase leading-tight text-[#0033FF]">{badge.label}</p>
              <p className={`text-[8px] font-bold uppercase leading-tight ${statusTone}`}>{badge.status}</p>
            </button>
          );
        })}
      </div>

      {activeBadge && (
        <div
          id={`report-badge-detail-${activeBadge.key}`}
          className="mt-3 rounded-sm border border-[#0033FF]/25 bg-white px-3 py-2 text-left"
        >
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#0033FF]">
            {activeBadge.label} — verification data
          </p>
          <ul className="mt-1.5 space-y-1 text-[10px] leading-snug text-slate-800">
            {activeBadge.evidence.map((line) => (
              <li key={line} className="flex gap-1.5">
                <span className="text-[#FF6600] shrink-0" aria-hidden>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
