'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Home has its own hero padding; login has no header. Add top padding for fixed header on all other pages.
  const needsHeaderOffset = pathname !== '/' && pathname !== '/login';
  // Must clear fixed UserHeader: mobile logo is h-28 (7rem) + py-3; sm+ uses shorter logo + py-4.
  // Previous pt-20 (5rem) left many pages (e.g. /admin tabs) hidden under the blue bar on phones.
  return (
    <div className={needsHeaderOffset ? 'pt-36 sm:pt-32 md:pt-36 lg:pt-40' : ''}>
      {children}
    </div>
  );
}
