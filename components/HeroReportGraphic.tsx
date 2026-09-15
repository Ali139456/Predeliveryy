'use client';

import Image from 'next/image';
import { SITE_HERO_REPORT_SRC } from '@/lib/siteLogo';

const REPORT_IMAGE_WIDTH = 2736;
const REPORT_IMAGE_HEIGHT = 1812;

/** Floating 3D-tilted inspection report (matches client hero mockup). */
export default function HeroReportGraphic() {
  return (
    <div className="hero-report-stage w-full h-full max-w-full flex justify-center lg:justify-end pointer-events-none select-none">
      <div className="hero-report-3d relative w-full h-full max-w-[min(100%,440px)] sm:max-w-[min(100%,540px)] md:max-w-[min(100%,640px)] lg:max-w-none">
        <div
          className="absolute -inset-6 sm:-inset-10 lg:-inset-12 bg-[#0033FF]/12 blur-3xl rounded-[40%] pointer-events-none -z-10"
          aria-hidden
        />
        <Image
          src={SITE_HERO_REPORT_SRC}
          alt="Pre Delivery inspection report with vehicle information, pass result, and verification badges"
          width={REPORT_IMAGE_WIDTH}
          height={REPORT_IMAGE_HEIGHT}
          priority
          unoptimized
          className="hero-report-image relative rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,51,255,0.35)]"
          sizes="(max-width: 1024px) 92vw, 58vw"
        />
      </div>
    </div>
  );
}
