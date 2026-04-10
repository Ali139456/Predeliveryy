'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '@/lib/siteLogo';

/**
 * Matches the PDF report header: brand blue band, logo, and report title.
 * Shown below the fixed app header on most routes (see MainContent).
 */
export default function AppReportBanner() {
  return (
    <header className="w-full shrink-0 border-b border-[#0029CC]/80 bg-[#0033FF] text-white shadow-sm">
      <div className="h-[3px] w-full bg-[#0029CC]" aria-hidden />
      <div className="container mx-auto max-w-full min-w-0 px-3 py-3 sm:px-4 md:px-6 sm:py-3.5">
        <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
          <Link
            href="/"
            className="inline-flex w-fit shrink-0 items-center rounded-md bg-white/10 p-1 ring-1 ring-white/20 transition hover:bg-white/15"
            aria-label="Pre Delivery home"
          >
            <Image
              src={SITE_LOGO_SRC}
              alt={SITE_LOGO_ALT}
              width={322}
              height={221}
              className="h-9 w-auto object-contain object-left sm:h-11"
              unoptimized
            />
          </Link>
          <p className="text-sm font-bold leading-snug tracking-tight text-white sm:text-base">
            Pre Delivery Inspection Report
          </p>
        </div>
        <div className="mt-2 h-px w-full max-w-2xl bg-white/25" aria-hidden />
      </div>
    </header>
  );
}
