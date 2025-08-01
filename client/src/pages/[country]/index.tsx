/**
 * Dynamic Country-Specific Landing Page
 *
 * Generates SEO-optimized landing pages for all 75+ target countries
 * with localized content, currency, language, and business data
 */

import GlobalSEOHead from '@/components/SEO/GlobalSEOHead';
import { ALL_CATEGORIES } from '@/data/categories';
import { CountrySEO, GLOBAL_SEO_CONFIG } from '@/data/global-seo-config';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface CountryPageProps {
  country: CountrySEO;
  topCategories: any[];
  marketStats: any;
  localSuppliers: any[];
}

export default function CountryPage({
  country,
  topCategories,
  marketStats,
  localSuppliers,
}: CountryPageProps) {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <>
      <GlobalSEOHead
        countryCode={country.code}
        pageType='homepage'
        customTitle={`Bell24H ${country.name} - B2B Marketplace | ${formatNumber(
          country.localSuppliers
        )}+ Verified Suppliers`}
        customDescription={`Leading B2B marketplace in ${country.name}. Connect with ${formatNumber(
          country.localSuppliers
        )}+ verified suppliers, manufacturers & exporters. ${
          country.marketSize
        } market opportunity. Get instant quotes.`}
        customKeywords={[
          `B2B marketplace ${country.name}`,
          `suppliers ${country.name}`,
          `manufacturers ${country.name}`,
          `exporters ${country.name}`,
          `wholesale ${country.name}`,
          ...country.keywords,
        ]}
      />

      <div className='min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900'>
        {/* Country-Specific Header */}
        <header className='bg-white/10 backdrop-blur-md border-b border-white/20'>
          <div className='max-w-7xl mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center'>
                  <span>🌍</span>
                </div>
                <div>
                  <h1 className='text-xl font-bold text-white'>Bell24H {country.name}</h1>
                  <p className='text-blue-200 text-sm'>
                    {country.language} | {country.currency}
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='text-right'>
                  <p className='text-white text-sm'>{country.localBusinessHours}</p>
                  <p className='text-blue-200 text-xs'>{country.timezone}</p>
                </div>
                <Link
                  href='/register'
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className='py-20 px-4'>
          <div className='max-w-6xl mx-auto text-center'>
            <div className='mb-8'>
              <h2 className='text-5xl font-bold text-white mb-4'>
                {country.name}'s Largest B2B Marketplace
              </h2>
              <p className='text-xl text-blue-200 mb-6'>
                Connect with {formatNumber(country.localSuppliers)}+ verified suppliers in{' '}
                {country.name}
              </p>
              <div className='bg-green-500/20 text-green-300 px-6 py-3 rounded-full inline-block mb-8'>
                <span className='font-semibold'>{country.marketSize}</span> market opportunity
              </div>
            </div>

            {/* Search Bar */}
            <div className='bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
                <div className='md:col-span-5'>
                  <input
                    type='text'
                    placeholder={`Search suppliers in ${country.name}...`}
                    className='w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none'
                  />
                </div>
                <div className='md:col-span-4'>
                  <select className='w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none'>
                    <option>All Categories</option>
                    {country.topIndustries.map(industry => (
                      <option key={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div className='md:col-span-3'>
                  <button className='w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-colors'>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Country Stats */}
        <section className='py-16 bg-white/5 backdrop-blur-sm'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='text-4xl font-bold text-white mb-2'>
                  {formatNumber(country.localSuppliers)}+
                </div>
                <div className='text-blue-200'>Verified Suppliers</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-white mb-2'>
                  {country.topIndustries.length}+
                </div>
                <div className='text-blue-200'>Top Industries</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-white mb-2'>
                  {country.certifications.length}+
                </div>
                <div className='text-blue-200'>Certifications</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-white mb-2'>24/7</div>
                <div className='text-blue-200'>Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Industries */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                Top Industries in {country.name}
              </h2>
              <p className='text-xl text-gray-600'>
                Explore leading sectors and connect with specialized suppliers
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {country.topIndustries.map((industry, index) => (
                <div
                  key={industry}
                  className='bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow'
                >
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4'>
                      <Factory className='h-6 w-6 text-blue-600' />
                    </div>
                    <div>
                      <h3 className='font-bold text-gray-900'>{industry}</h3>
                      <p className='text-sm text-gray-500'>
                        {Math.floor(country.localSuppliers / country.topIndustries.length)}+
                        suppliers
                      </p>
                    </div>
                  </div>
                  <div className='text-sm text-gray-600'>
                    Leading {industry.toLowerCase()} suppliers in {country.name} with international
                    quality standards.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods & Certifications */}
        <section className='py-20 bg-blue-50'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
              {/* Payment Methods */}
              <div>
                <h3 className='text-3xl font-bold text-gray-900 mb-8'>Accepted Payment Methods</h3>
                <div className='grid grid-cols-2 gap-4'>
                  {country.paymentMethods.map(method => (
                    <div
                      key={method}
                      className='bg-white p-4 rounded-lg border border-gray-200 flex items-center'
                    >
                      <span>💳</span>
                      <span className='font-medium text-gray-900'>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className='text-3xl font-bold text-gray-900 mb-8'>Required Certifications</h3>
                <div className='grid grid-cols-2 gap-4'>
                  {country.certifications.map(cert => (
                    <div
                      key={cert}
                      className='bg-white p-4 rounded-lg border border-gray-200 flex items-center'
                    >
                      <Award className='h-5 w-5 text-blue-600 mr-3' />
                      <span className='font-medium text-gray-900'>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Regulations */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                {country.name} Business Regulations
              </h2>
              <p className='text-xl text-gray-600'>
                Stay compliant with local business requirements
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {country.regulations.map(regulation => (
                <div key={regulation} className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-center mb-4'>
                    <span>🛡️</span>
                    <h3 className='font-bold text-gray-900'>{regulation}</h3>
                  </div>
                  <p className='text-sm text-gray-600'>
                    Compliance with {regulation} standards required for business operations in{' '}
                    {country.name}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white'>
          <div className='max-w-4xl mx-auto px-4 text-center'>
            <h2 className='text-4xl font-bold mb-6'>
              Ready to Connect with {country.name} Suppliers?
            </h2>
            <p className='text-xl text-blue-200 mb-8'>
              Join {formatNumber(country.localSuppliers)}+ verified suppliers and buyers in{' '}
              {country.name}
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/register'
                className='bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors'
              >
                Register as Supplier
              </Link>
              <Link
                href='/categories'
                className='border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-colors'
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='bg-gray-900 text-white py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div>
                <h3 className='text-xl font-bold mb-4'>Bell24H {country.name}</h3>
                <p className='text-gray-400 mb-4'>
                  Leading B2B marketplace connecting {formatNumber(country.localSuppliers)}+
                  suppliers in {country.name}
                </p>
                <div className='flex items-center space-x-4'>
                  <span>📍</span>
                  <span className='text-gray-400'>{country.name}</span>
                </div>
              </div>

              <div>
                <h4 className='text-lg font-semibold mb-4'>Contact Information</h4>
                <div className='space-y-2 text-gray-400'>
                  <div className='flex items-center space-x-2'>
                    <span>🕐</span>
                    <span>{country.localBusinessHours}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span>📞</span>
                    <span>+91-80-4040-7000</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span>📧</span>
                    <span>support@bell24h.com</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='text-lg font-semibold mb-4'>Market Information</h4>
                <div className='space-y-2 text-gray-400'>
                  <div>Market Size: {country.marketSize}</div>
                  <div>Currency: {country.currency}</div>
                  <div>Timezone: {country.timezone}</div>
                  <div>Language: {country.language}</div>
                </div>
              </div>
            </div>

            <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
              <p>© 2024 Bell24H {country.name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { country: countryParam } = context.params as { country: string };

  // Find country by code or name
  const country =
    Object.values(GLOBAL_SEO_CONFIG).find(
      c =>
        c.code.toLowerCase() === countryParam.toLowerCase() ||
        c.name.toLowerCase() === countryParam.toLowerCase()
    ) || GLOBAL_SEO_CONFIG['IN'];

  // Generate top categories for this country
  const topCategories = ALL_CATEGORIES.slice(0, 8).map(cat => ({
    ...cat,
    supplierCount: Math.floor(country.localSuppliers / 10) + Math.floor(Math.random() * 1000),
  }));

  // Generate market stats
  const marketStats = {
    totalSuppliers: country.localSuppliers,
    totalCategories: ALL_CATEGORIES.length,
    monthlyRFQs: Math.floor(country.localSuppliers / 20),
    averageRating: 4.6,
  };

  // Generate sample local suppliers
  const localSuppliers = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `${country.name} Supplier ${i + 1}`,
    category: country.topIndustries[i % country.topIndustries.length],
    rating: 4.2 + Math.random() * 0.6,
    location: country.name,
    verified: true,
  }));

  return {
    props: {
      country,
      topCategories,
      marketStats,
      localSuppliers,
    },
  };
};
