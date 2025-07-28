import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bell24h - Advanced B2B Marketplace with AI Features',
  description: 'India\'s premier B2B marketplace with voice RFQ, AI explainability, risk scoring, and real-time market intelligence.',
  keywords: 'B2B marketplace, voice RFQ, AI explainability, supplier risk scoring, market intelligence, India business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
