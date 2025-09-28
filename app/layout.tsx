import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers/session-provider'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com'

export const metadata: Metadata = {
  title: 'Bell24h - India\'s Fastest B2B Match-Making Engine',
  description: 'Post RFQ. Get 3 Verified Quotes in 24 Hours. Bell24h uses 200 live data signals to match you with pre-qualified Indian suppliers.',
  keywords: 'B2B marketplace, RFQ, suppliers, procurement, India, MSME, escrow, verified suppliers',
  authors: [{ name: 'Bell24h Team' }],
  openGraph: {
    title: 'Bell24h - India\'s Fastest B2B Match-Making Engine',
    description: 'Post RFQ. Get 3 Verified Quotes in 24 Hours. Trust-first, AI-powered B2B marketplace.',
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Bell24h',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bell24h - B2B Match-Making Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bell24h - India\'s Fastest B2B Match-Making Engine',
    description: 'Post RFQ. Get 3 Verified Quotes in 24 Hours. Trust-first, AI-powered B2B marketplace.',
    images: [`${siteUrl}/og-image.jpg`],
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
  alternates: {
    canonical: siteUrl,
  },
  other: {
    'msapplication-TileColor': '#4F46E5',
    'theme-color': '#4F46E5',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Analytics - Load lazily and respect Do Not Track */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
        )}
        
        {/* Plausible Analytics */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            strategy="lazyOnload"
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            defer
          />
        )}
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
        
        {/* Vercel Speed Insights */}
        <SpeedInsights />
        
        {/* Analytics Scripts */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script id="google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                anonymize_ip: true,
                respect_dnt: navigator.doNotTrack === '1'
              });
            `}
          </Script>
        )}
      </body>
    </html>
  )
}
