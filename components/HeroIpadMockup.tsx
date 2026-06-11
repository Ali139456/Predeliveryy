'use client';

import Image from 'next/image';
import { SITE_HERO_REPORT_SRC } from '@/lib/siteLogo';

/** iPad-style frame showing the Pre Delivery inspection report graphic. */
export default function HeroIpadMockup() {
  return (
    <div className="hero-ipad relative mx-auto w-full max-w-[min(100%,560px)]">
      {/* Soft glow behind device */}
      <div
        className="absolute -inset-4 sm:-inset-6 rounded-[3rem] bg-[#0033FF]/10 blur-2xl pointer-events-none"
        aria-hidden
      />

      <div className="relative rounded-[2rem] sm:rounded-[2.25rem] border-[10px] sm:border-[12px] border-slate-800 bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,51,255,0.35)] p-2 sm:p-2.5">
        {/* Front camera */}
        <div
          className="absolute top-[18px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-700 ring-1 ring-slate-600 z-10"
          aria-hidden
        />

        <div className="relative rounded-[1.15rem] sm:rounded-[1.35rem] overflow-hidden bg-white aspect-[4/3]">
          <Image
            src={SITE_HERO_REPORT_SRC}
            alt="Pre Delivery inspection report - vehicle information and pass result"
            fill
            priority
            className="object-cover object-top"
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 560px"
          />
        </div>
      </div>
    </div>
  );
}
