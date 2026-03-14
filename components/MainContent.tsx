'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Home has its own hero padding; login has no header. Add top padding for fixed header on all other pages.
  const needsHeaderOffset = pathname !== '/' && pathname !== '/login';
  return (
    <div className={needsHeaderOffset ? 'pt-20 sm:pt-24 md:pt-28' : ''}>
      {children}
    </div>
  );
}
