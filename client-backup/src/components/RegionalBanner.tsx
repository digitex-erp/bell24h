import React from 'react';

interface RegionalBannerProps {
  userRegion: 'Tier1' | 'Tier2' | 'Global';
}

const regionContent = {
  Tier1: {
    title: 'Enterprise Solutions for Tier-1 Cities',
    message: 'Unlock advanced blockchain, escrow, and dedicated support for Mumbai, Delhi, Bangalore.',
    cta: 'Contact Enterprise Sales',
    link: '/contact-sales',
    color: 'bg-yellow-100 text-yellow-900',
  },
  Tier2: {
    title: 'Upgrade to Pro in Tier-2 Cities',
    message: 'Get AI explainability, analytics, and local case studies for Surat, Ludhiana.',
    cta: 'Upgrade to Pro',
    link: '/subscribe/professional',
    color: 'bg-green-100 text-green-900',
  },
  Global: {
    title: 'Welcome Global Users!',
    message: 'Explore Free tier, multilingual support, and cross-border trade features.',
    cta: 'Get Started Free',
    link: '/signup',
    color: 'bg-blue-100 text-blue-900',
  },
};

export const RegionalBanner: React.FC<RegionalBannerProps> = ({ userRegion }) => {
  const content = regionContent[userRegion] || regionContent.Global;
  return (
    <div className={`rounded-lg p-4 mb-6 flex flex-col items-center ${content.color}`}>
      <h3 className="text-lg font-bold mb-1">{content.title}</h3>
      <p className="mb-2">{content.message}</p>
      <a
        href={content.link}
        className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-opacity-80 transition"
      >
        {content.cta}
      </a>
    </div>
  );
};
