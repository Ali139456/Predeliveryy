import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import UserHeader from '@/components/UserHeader';
import MainContent from '@/components/MainContent';

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


