import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import MainContent from '@/components/MainContent';

const UserHeader = dynamic(() => import('@/components/UserHeader'), {
  ssr: true,
  loading: () => (
    <div className="fixed top-0 left-0 right-0 z-50 h-[4.5rem] sm:h-16 md:h-20 lg:h-24 bg-[#0033FF] animate-pulse" aria-hidden />
  ),
});

export const metadata: Metadata = {
  title: 'Pre delivery inspection App',
  description: 'Comprehensive pre-delivery inspection management system',
  icons: {
    icon: '/Pre-Delivery-Favicon-Transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <UserHeader />
          <MainContent>{children}</MainContent>
        </AuthProvider>
      </body>
    </html>
  );
}


