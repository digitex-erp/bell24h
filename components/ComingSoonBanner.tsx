// components/ComingSoonBanner.tsx - Disable broken features with coming soon banners
'use client';

import { Clock, Zap } from 'lucide-react';

interface ComingSoonBannerProps {
  feature: string;
  description?: string;
  estimatedDate?: string;
  className?: string;
}

export default function ComingSoonBanner({
  feature,
  description,
  estimatedDate = "Coming Soon",
  className = ""
}: ComingSoonBannerProps) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-amber-800">
            {feature} - {estimatedDate}
          </h3>
          {description && (
            <p className="text-amber-700 mt-1">
              {description}
            </p>
          )}
          <div className="mt-3 flex items-center text-sm text-amber-600">
            <Zap className="h-4 w-4 mr-1" />
            <span>This feature is currently in development and will be available soon.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Specific banners for different features
export function AIFeatureBanner() {
  return (
    <ComingSoonBanner
      feature="AI-Powered Features"
      description="Advanced AI matching, content generation, and intelligent recommendations are being developed."
      estimatedDate="Q4 2025"
      className="mb-6"
    />
  );
}

export function BlockchainFeatureBanner() {
  return (
    <ComingSoonBanner
      feature="Blockchain Escrow"
      description="Secure blockchain-based escrow system for high-value transactions is under development."
      estimatedDate="Q1 2026"
      className="mb-6"
    />
  );
}

export function VideoRFQBanner() {
  return (
    <ComingSoonBanner
      feature="Video RFQ"
      description="Record video RFQ with product samples and get AI-powered analysis."
      estimatedDate="Q2 2026"
      className="mb-6"
    />
  );
}

export function VoiceRFQBanner() {
  return (
    <ComingSoonBanner
      feature="Voice RFQ"
      description="Record your RFQ requirements using voice and get AI-powered transcription."
      estimatedDate="Q2 2026"
      className="mb-6"
    />
  );
}

export function AdvancedAnalyticsBanner() {
  return (
    <ComingSoonBanner
      feature="Advanced Analytics"
      description="Real-time analytics, market intelligence, and predictive insights are being developed."
      estimatedDate="Q1 2026"
      className="mb-6"
    />
  );
}

export function NegotiationEngineBanner() {
  return (
    <ComingSoonBanner
      feature="AI Negotiation Engine"
      description="Automated negotiation system with multi-party support and intelligent deal closure."
      estimatedDate="Q2 2026"
      className="mb-6"
    />
  );
}
