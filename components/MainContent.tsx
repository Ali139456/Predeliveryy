'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const isResetPassword = pathname === '/reset-password';
  // Login / reset-password have no fixed UserHeader; other routes need offset for the fixed bar.
  const needsHeaderOffset = !isLogin && !isResetPassword;
  const isHome = pathname === '/';

  // Reset window scroll when navigating (e.g. form → admin). Preserved scroll + sticky tabs caused overlap.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, [pathname]);

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
