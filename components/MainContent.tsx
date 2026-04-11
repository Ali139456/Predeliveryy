'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  // Login has no UserHeader; all other routes need offset for the fixed bar.
  const needsHeaderOffset = !isLogin;
  const isHome = pathname === '/';

  return (
    <div
      className={
        needsHeaderOffset
          ? `pt-36 sm:pt-32 md:pt-36 lg:pt-40${isHome ? ' bg-[#0033FF]' : ''}`
          : ''
      }
    >
      {children}
    </div>
  );
}
