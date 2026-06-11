'use client';

import Image from 'next/image';
import { SITE_HERO_REPORT_SRC } from '@/lib/siteLogo';

/** Native pixel size of public/image.png — keep in sync if the asset is replaced. */
const REPORT_IMAGE_WIDTH = 496;
const REPORT_IMAGE_HEIGHT = 310;

/** Floating 3D-tilted inspection report (matches client hero mockup). */
export default function HeroReportGraphic() {
  return (
    <div className="hero-report-stage w-full flex justify-center lg:justify-end pointer-events-none select-none">
      <div className="hero-report-3d relative w-full max-w-[min(100%,920px)] sm:max-w-[min(100%,980px)] lg:max-w-none lg:w-[128%] xl:w-[138%] 2xl:w-[148%]">
        <div
          className="absolute -inset-10 sm:-inset-14 bg-[#0033FF]/12 blur-3xl rounded-[40%] pointer-events-none -z-10"
          aria-hidden
        />
        <Image
          src={SITE_HERO_REPORT_SRC}
          alt="Pre Delivery inspection report with vehicle information, pass result, and verification badges"
          width={REPORT_IMAGE_WIDTH}
          height={REPORT_IMAGE_HEIGHT}
          priority
          unoptimized
          className="relative w-full h-auto rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,51,255,0.35)]"
          sizes="(max-width: 1024px) 100vw, 920px"
        />
      </div>
    </div>
  );
}
