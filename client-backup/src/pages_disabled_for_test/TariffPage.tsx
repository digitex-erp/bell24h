import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tariffService } from '../services/tariff.service.js';
import type { Tariff } from '../types/tariff.js';
import { tariffFeatures } from '../data/tariffFeatures';
import { RegionalBanner } from '../components/RegionalBanner';

interface TariffPageProps {
  className?: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  highlight?: boolean;
}

const FEATURES: Feature[] = [
  { id: 'rfq', name: 'RFQs per month', description: 'Number of RFQs you can create each month', included: true },
  { id: 'suppliers', name: 'Supplier Connections', description: 'Number of suppliers you can connect with', included: true },
  { id: 'analytics', name: 'Advanced Analytics', description: 'Access to detailed analytics and insights', included: false },
  { id: 'support', name: 'Priority Support', description: '24/7 priority customer support', included: false },
  { id: 'api', name: 'API Access', description: 'Full access to our API for custom integrations', included: false },
  { id: 'team', name: 'Team Members', description: 'Number of team members who can access the account', included: true },
  { id: 'storage', name: 'Storage Space', description: 'Cloud storage for your documents and files', included: true },
  { id: 'export', name: 'Data Export', description: 'Export your data in multiple formats', included: false },
];

export default function TariffPage({ className }: TariffPageProps) {
  const { t } = useTranslation();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        setIsLoading(true);
        const data = await tariffService.getTariffs();
        setTariffs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tariffs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTariffs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Stub: Replace with actual region detection (e.g., from user profile or IP)
  const userRegion: 'Tier1' | 'Tier2' | 'Global' = 'Global';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Regional Banner */}
      <RegionalBanner userRegion={userRegion} />
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">
          {t('tariff.title')}
        </h1>
        <p className="mt-5 text-xl text-gray-500 sm:text-center">
          {t('tariff.subtitle')}
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-5xl xl:mx-0 xl:max-w-none">
        {tariffs.map((tariff) => (
          <div
            key={tariff.id}
            className={`divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm ${tariff.isPopular ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
          >
            {tariff.isPopular && (
              <div className="rounded-t-lg bg-blue-500 py-2 px-6 text-center text-sm font-semibold text-white">
                Most popular
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-medium leading-6 text-gray-900">{tariff.name}</h2>
              <p className="mt-4 text-sm text-gray-500">{tariff.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${tariff.price}
                </span>{' '}
                <span className="text-base font-medium text-gray-500">
                  /month
                </span>
              </p>
              <button
                onClick={() => window.location.href = `/subscribe/${tariff.id}`}
                className="mt-8 w-full rounded-md py-3 px-6 text-center text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                {t('tariff.subscribe')}
              </button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-sm font-medium text-gray-900">{t('tariff.features')}</h3>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <span className="ml-3 text-sm text-gray-700">
                    {t('tariff.maxUsers', { count: tariff.maxUsers || 'Unlimited' })}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="ml-3 text-sm text-gray-700">
                    {t('tariff.maxStorage', { size: tariff.maxStorage || 'Unlimited' })}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="ml-3 text-sm text-gray-700">
                    {t('tariff.maxRequests', { count: tariff.maxRequests || 'Unlimited' })}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Feature</th>
                <th className="py-2 px-4 text-center">Free</th>
                <th className="py-2 px-4 text-center">Pro</th>
                <th className="py-2 px-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {tariffFeatures.map((feature, idx) => (
                <tr key={feature.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 font-medium" title={feature.description}>{feature.name}</td>
                  {/* Special handling for File Upload & Storage */}
                  {feature.name === 'File Upload & Storage' ? (
                    <>
                      <td className="py-2 px-4 text-center">{feature.free}</td>
                      <td className="py-2 px-4 text-center">{feature.pro}</td>
                      <td className="py-2 px-4 text-center">{feature.enterprise}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-4 text-center">{feature.free ? '✔️' : ''}</td>
                      <td className="py-2 px-4 text-center">{feature.pro ? '✔️' : ''}</td>
                      <td className="py-2 px-4 text-center">{feature.enterprise ? '✔️' : ''}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 sm:text-4xl mb-12">
          {t('tariff.faq.title')}
        </h2>
        <div className="space-y-6">
          {[
            'trial',
            'changePlan',
            'payment',
            'rfqLimit',
            'enterprise'
          ].map((faqKey) => (
            <div key={faqKey} className="border-b border-gray-200 pb-6">
              <button className="w-full flex justify-between items-center text-left">
                <span className="text-lg font-medium text-gray-900">
                  {t(`tariff.faq.items.${faqKey}.question`)}
                </span>
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="mt-2 pr-6">
                <p className="text-gray-600">
                  {t(`tariff.faq.items.${faqKey}.answer`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            {t('tariff.cta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
            {t('tariff.cta.subtitle')}
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
              onClick={() => window.location.href = '/subscribe/professional'}
            >
              {t('tariff.cta.trial')}
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-white px-6 py-3 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
              onClick={() => window.location.href = '/contact-sales'}
            >
              {t('tariff.cta.sales')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
