'use client';

import { usePathname } from 'next/navigation';
import AppReportBanner from '@/components/AppReportBanner';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  // Login has no UserHeader; all other routes need offset for the fixed bar (incl. home once banner is shown).
  const needsHeaderOffset = !isLogin;
  const showReportBanner = !isLogin;

  return (
    <div className={needsHeaderOffset ? 'pt-36 sm:pt-32 md:pt-36 lg:pt-40' : ''}>
      {showReportBanner && <AppReportBanner />}
      {children}
    </div>
  );
}
