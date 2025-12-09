import type { Metadata } from 'next';
import './globals.css';
import UserHeader from '@/components/UserHeader';

export const metadata: Metadata = {
  title: 'PreDelivery App',
  description: 'Comprehensive pre-delivery inspection management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <UserHeader />
        {children}
      </body>
    </html>
  );
}


