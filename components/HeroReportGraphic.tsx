'use client';

import Image from 'next/image';
import { SITE_HERO_REPORT_SRC } from '@/lib/siteLogo';

/** Floating inspection report graphic (no device frame). */
export default function HeroReportGraphic() {
  return (
    <div className="hero-report relative w-full flex flex-col items-center lg:items-end">
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#0033FF] mb-3 sm:mb-4 text-center lg:text-right w-full">
        Sample inspection report
      </p>

      <div className="relative w-full max-w-[min(100%,680px)] lg:max-w-[720px]">
        <div
          className="absolute -inset-6 sm:-inset-10 bg-[#0033FF]/12 blur-3xl rounded-full pointer-events-none"
          aria-hidden
        />
        <Image
          src={SITE_HERO_REPORT_SRC}
          alt="Pre Delivery inspection report with vehicle information, pass result, and verification badges"
          width={1400}
          height={980}
          priority
          className="relative w-full h-auto drop-shadow-[0_28px_60px_rgba(0,51,255,0.22)] rotate-[1.5deg] sm:rotate-2 lg:rotate-[2.5deg] lg:translate-x-4 xl:translate-x-8"
          sizes="(max-width: 640px) 94vw, (max-width: 1024px) 88vw, 720px"
        />
      </div>
    </div>
  );
}
