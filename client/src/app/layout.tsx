import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/navigation-fixes.css';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import AIChatAssistant from '@/components/AIChatAssistant';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bell24h-v1.vercel.app'),
  title: 'Bell24h – India\'s AI B2B Marketplace | Supplier Matching & RFQs',
  description: 'India\'s premier AI-powered B2B marketplace connecting manufacturers and suppliers. Create RFQs with voice commands, AI matching, and secure escrow payments.',
  keywords: 'AI B2B marketplace India, supplier matching, voice RFQ, manufacturing, MSME, trade finance, escrow payments',
  openGraph: {
    title: 'Bell24h – India\'s AI B2B Marketplace',
    description: 'Connect with verified Indian suppliers using AI-powered matching and voice RFQ creation.',
    url: 'https://bell24h-v1.vercel.app',
    siteName: 'Bell24h',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bell24h AI B2B Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bell24h – India\'s AI B2B Marketplace',
    description: 'Connect with verified Indian suppliers using AI-powered matching and voice RFQ creation.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Schema Markup for B2B Platform */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "B2BPlatform",
              "name": "Bell24h",
              "description": "India's first AI-powered B2B marketplace for manufacturers and suppliers",
              "url": "https://bell24h-v1.vercel.app",
              "sameAs": [
                "https://linkedin.com/company/bell24h",
                "https://twitter.com/bell24h"
              ],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://bell24h-v1.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR",
                "description": "Free supplier registration and RFQ creation"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
          <AIChatAssistant />
          <GoogleAnalytics />
        </AuthProvider>
      </body>
    </html>
  );
}
