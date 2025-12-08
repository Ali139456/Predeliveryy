import type { Metadata } from 'next';
import './globals.css';
import UserHeader from '@/components/UserHeader';

export const metadata: Metadata = {
  title: 'Hazard Inspect App',
  description: 'Comprehensive hazard inspection management system',
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


