'use client';

import Image from 'next/image';
import { SITE_HERO_REPORT_SRC } from '@/lib/siteLogo';

/** Floating 3D-tilted inspection report (matches client hero mockup). */
export default function HeroReportGraphic() {
  return (
    <div className="hero-report-stage w-full flex justify-center lg:justify-end pointer-events-none select-none">
      <div className="hero-report-3d relative w-full max-w-[min(100%,760px)] lg:max-w-none lg:w-[108%] xl:w-[112%]">
        <div
          className="absolute -inset-8 sm:-inset-12 bg-[#0033FF]/15 blur-3xl rounded-[40%] pointer-events-none"
          aria-hidden
        />
        <Image
          src={SITE_HERO_REPORT_SRC}
          alt="Pre Delivery inspection report with vehicle information, pass result, and verification badges"
          width={1400}
          height={980}
          priority
          className="relative w-full h-auto rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,51,255,0.35)]"
          sizes="(max-width: 640px) 94vw, (max-width: 1024px) 90vw, 760px"
        />
      </div>
    </div>
  );
}
