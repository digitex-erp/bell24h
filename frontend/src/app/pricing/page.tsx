'use client'

import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    id: 'free',
    price: '₹0',
    frequency: '/month',
    description: 'Perfect for getting started with RFQ marketplace.',
    features: [
      '5 RFQs/month',
      'Basic AI matching',
      'Wallet access',
      'Email support'
    ],
    cta: 'Get Started',
    mostPopular: false,
  },
  {
    name: 'Basic',
    id: 'basic',
    price: '₹999',
    frequency: '/month',
    description: 'For growing businesses seeking more features.',
    features: [
      '25 RFQs/month',
      'Advanced AI matching',
      'Voice RFQ submission',
      'Priority support',
      'Basic analytics',
      'Supplier risk scoring'
    ],
    cta: 'Start Free Trial',
    mostPopular: true,
  },
  {
    name: 'Premium',
    id: 'premium',
    price: '₹2,499',
    frequency: '/month',
    description: 'For businesses requiring advanced features and support.',
    features: [
      'Unlimited RFQs',
      'AI-powered analytics',
      'Voice & video RFQs',
      '24/7 phone support',
      'Advanced analytics',
      'Market trend insights',
      'Blockchain verification',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    mostPopular: false,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    price: 'Custom',
    frequency: '',
    description: 'For large organizations with custom requirements.',
    features: [
      'Everything in Premium',
      'Custom AI models',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom reporting',
      'API access',
      'On-premise deployment',
      'Training & workshops'
    ],
    cta: 'Contact Sales',
    mostPopular: false,
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PricingPage() {
  const [billingFrequency, setBillingFrequency] = useState('monthly')

  return (
    <div className="bg-gray-50">
      <div className="px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose the Right Plan for Your Business
          </h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Scale your RFQ management with our flexible pricing plans
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? 'border-2 border-indigo-600 shadow-md'
                  : 'border border-gray-200',
                'rounded-lg shadow-sm divide-y divide-gray-200 bg-white'
              )}
            >
              <div className="p-6">
                {tier.mostPopular && (
                  <p className="absolute top-0 py-1.5 px-4 bg-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
                    Most popular
                  </p>
                )}
                <h3
                  className={classNames(
                    tier.mostPopular ? 'text-indigo-600' : 'text-gray-900',
                    'text-lg font-semibold'
                  )}
                >
                  {tier.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {tier.frequency}
                  </span>
                </p>
                <Link
                  href={tier.id === 'enterprise' ? '/contact' : '/signup'}
                  className={classNames(
                    tier.mostPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                    'mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium'
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What&apos;s included
                </h4>
                <ul role="list" className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon
                        className={classNames(
                          tier.mostPopular
                            ? 'text-indigo-500'
                            : 'text-green-500',
                          'flex-shrink-0 h-5 w-5'
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-extrabold text-gray-900">
            Frequently Asked Questions
          </h3>
          <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {[
              {
                question: 'Can I upgrade my plan anytime?',
                answer:
                  'Yes, you can upgrade your plan at any time. The new charges will be prorated for the remaining billing period.',
              },
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept all major credit cards, UPI, and bank transfers for Indian businesses.',
              },
              {
                question: 'Is there a long-term contract?',
                answer:
                  'No, all our plans are month-to-month. You can cancel anytime without any cancellation fees.',
              },
            ].map((faq) => (
              <div key={faq.question} className="text-left">
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base text-gray-500">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
