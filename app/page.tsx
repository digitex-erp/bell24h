import dynamic from 'next/dynamic';
import Script from 'next/script';
import { featureFlags } from '@/lib/featureFlags';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import Logos from '@/components/Logos';
import Timeline from '@/components/Timeline';
import ROI from '@/components/ROI';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CanvasBackground = dynamic(()=>import('@/components/CanvasBackground'),{ ssr:false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com';

// JSON-LD Structured Data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bell24h",
  "url": siteUrl,
  "logo": `${siteUrl}/logo.png`,
  "description": "India's fastest B2B match-making engine connecting MSMEs with verified suppliers",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressLocality": "India"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9004962871",
    "contactType": "customer service",
    "email": "digitex.studio@gmail.com"
  },
  "sameAs": [
    "https://www.bell24h.com"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Bell24h",
  "url": siteUrl,
  "description": "Post RFQ. Get 3 Verified Quotes in 24 Hours. Trust-first, AI-powered B2B marketplace.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bell24h"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": siteUrl
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Bell24h?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bell24h is India's fastest B2B match-making engine that connects MSMEs with verified suppliers. Post your RFQ and get 3 verified quotes in 24 hours using 200+ live data signals for AI-powered matching."
      }
    },
    {
      "@type": "Question",
      "name": "How does the escrow system work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bell24h uses escrow-secured payments where your payment is held safely until you're satisfied with the delivered goods or services. This ensures trust and security in all B2B transactions."
      }
    },
    {
      "@type": "Question",
      "name": "What is the refund policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a comprehensive refund policy. If you're not satisfied with the delivered goods or services, you can request a refund within the specified timeframe. All refunds are processed through our secure escrow system."
      }
    }
  ]
};

export default function Page(){
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <main id="content" className="min-h-screen bg-[#0b1220] text-white">
        <Header />
        {featureFlags.enableCanvas ? <CanvasBackground/> : null}

        <section className="relative">
          <Hero />
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <div className="mt-8">
            <SearchBar />
          </div>

          {/* Existing features grid goes here; keep your current component unchanged */}
          <div className="mt-14">
            {/* <ExistingFeaturesGrid /> */}
        </div>

          <div className="mt-16">
            <ErrorBoundary fallback={<div className="text-neutral-300">Loading trusted brands…</div>}>
              <Logos />
            </ErrorBoundary>
        </div>

          <div className="mt-20">
            <Timeline />
          </div>

          <div className="mt-20 mb-28">
            <ROI />
          </div>
        </section>
      </main>
    </>
  );
}