'use client';

// DYNAMIC PRICING CONFIG - Easily updatable
const PRICING_CONFIG = {
  plans: {
    startup: {
      monthly: 49999,
      yearly: 499990, // 17% discount
      features: [
        'Up to 500 supplier connections',
        'Basic AI matching algorithm',
        'Email & chat support',
        '₹25 Crore ECGC coverage',
        'Basic analytics dashboard',
        '25 RFQ submissions/month',
        'Standard response time',
        'Mobile app access',
      ],
      excluded: [
        'SHAP/LIME explainability',
        'Priority support',
        'Custom integrations',
        'Dedicated account manager',
      ],
    },
    professional: {
      monthly: 199999,
      yearly: 1999990, // 17% discount
      features: [
        'Unlimited supplier connections',
        'SHAP/LIME AI explainability',
        'Priority phone & chat support',
        '₹1 Crore ECGC coverage',
        'Advanced analytics & BI',
        'Unlimited RFQ submissions',
        'Global trade facilitation',
        'API integrations',
        'Custom dashboard',
        'Bulk operations',
        'Export management',
        'Compliance automation',
      ],
      excluded: [
        'White-label solution',
        'Custom AI models',
        'Dedicated account manager',
        'SLA guarantees',
      ],
    },
    enterprise: {
      monthly: 'custom',
      yearly: 'custom',
      features: [
        'White-label solution',
        'Custom AI model training',
        'Dedicated account manager',
        'Unlimited ECGC coverage',
        'Custom dashboard & reports',
        'Enterprise integrations',
        'SLA guarantees (99.9%)',
        '24/7 dedicated support',
        'Custom workflows',
        'Advanced security',
        'Compliance management',
        'Multi-tenant architecture',
        'Custom branding',
        'Priority development',
        'Executive support',
      ],
      excluded: [],
    },
  },
  addOns: {
    additionalECGC: {
      name: 'Additional ECGC Coverage',
      price: 'From ₹5,999/month per ₹1Cr coverage',
    },
    premiumSupport: {
      name: 'Premium Support Package',
      price: '₹99,999/month',
    },
    customIntegration: {
      name: 'Custom Integration Development',
      price: '₹4,99,999 one-time',
    },
  },
};

const tiers = [
  { name: 'Free', price: '₹0', features: ['5 RFQs/month', 'Basic AI', 'Wallet access'] },
  { name: 'Pro', price: '₹15k/year', features: ['Unlimited RFQs', 'SHAP', 'Priority support'] },
  {
    name: 'Enterprise',
    price: '₹50k/month',
    features: ['Custom AI', 'API', 'Escrow', 'Invoice discounting'],
  },
];
export default function PricingPage() {
  return (
    <main className='max-w-6xl mx-auto py-12 px-4'>
      <h1 className='text-4xl font-bold text-center mb-10'>Pricing – Beating IndiaMART</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {tiers.map(t => (
          <div key={t.name} className='border rounded-xl p-6 shadow'>
            <h2 className='text-2xl font-semibold'>{t.name}</h2>
            <p className='text-3xl font-bold text-amber-600 my-2'>{t.price}</p>
            <ul className='text-sm space-y-2'>
              {t.features.map(f => (
                <li key={f}>✔ {f}</li>
              ))}
            </ul>
            <button className='mt-4 w-full bg-amber-600 text-white rounded-lg py-2'>
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
