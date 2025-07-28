'use client';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function WalletTermsPage() {
  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const handleAcceptSection = (sectionId: string) => {
    const newAccepted = new Set(acceptedSections);
    newAccepted.add(sectionId);
    setAcceptedSections(newAccepted);
  };

  const handleAcceptAll = () => {
    setAcceptedSections(
      new Set(['wallet-usage', 'razorpay-partnership', 'tax-obligations', 'cross-border'])
    );
  };

  const sections = [
    {
      id: 'wallet-usage',
      title: 'Wallet Usage Terms',
      content: `
        <h3>1. Wallet Creation and Management</h3>
        <p>• Wallet creation is mandatory for all GST-registered users</p>
        <p>• Automatic wallet creation upon successful GST verification</p>
        <p>• Multi-currency support (INR, USD, EUR, GBP, AED)</p>
        <p>• Real-time balance tracking and transaction history</p>
        
        <h3>2. Transaction Limits</h3>
        <p>• Daily limit: ₹10,00,000 for verified users</p>
        <p>• Monthly limit: ₹1,00,00,000 for premium accounts</p>
        <p>• International: $50,000 equivalent per transaction</p>
        
        <h3>3. Security Measures</h3>
        <p>• Bank-grade security with PCI DSS compliance</p>
        <p>• Multi-factor authentication for high-value transactions</p>
        <p>• Real-time fraud detection and monitoring</p>
        <p>• Encrypted data transmission and storage</p>
      `,
    },
    {
      id: 'razorpay-partnership',
      title: 'RazorpayX Partnership Disclosure',
      content: `
        <h3>1. Partnership Details</h3>
        <p>• Bell24H partners with RazorpayX for wallet services</p>
        <p>• RazorpayX Route Accounts provide banking infrastructure</p>
        <p>• RBI-regulated payment gateway integration</p>
        <p>• PCI DSS Level 1 certified security</p>
        
        <h3>2. Account Management</h3>
        <p>• Automatic Route Account creation upon wallet activation</p>
        <p>• Virtual account numbers for seamless transactions</p>
        <p>• Real-time settlement and reconciliation</p>
        <p>• Multi-bank support for enhanced reliability</p>
        
        <h3>3. Fee Structure</h3>
        <p>• No setup fees for wallet creation</p>
        <p>• Transaction fees: 0.5% for domestic, 1% for international</p>
        <p>• Monthly maintenance fee: ₹500 for premium accounts</p>
        <p>• Currency conversion fees: 2% for cross-border transactions</p>
      `,
    },
    {
      id: 'tax-obligations',
      title: 'Tax Obligations and TDS Policy',
      content: `
        <h3>1. GST Compliance</h3>
        <p>• Automatic GST calculation for applicable transactions</p>
        <p>• Real-time tax liability tracking and reporting</p>
        <p>• Integration with GST portal for compliance verification</p>
        <p>• Monthly GST return generation and filing support</p>
        
        <h3>2. TDS Deduction</h3>
        <p>• Automatic TDS calculation for transactions above ₹100,000</p>
        <p>• TDS rate: 1% for business transactions</p>
        <p>• Quarterly TDS return filing assistance</p>
        <p>• TDS certificate generation and distribution</p>
        
        <h3>3. Tax Reporting</h3>
        <p>• Annual tax summary generation</p>
        <p>• Form 26AS integration for TDS verification</p>
        <p>• Tax audit support and documentation</p>
        <p>• Professional tax consultation services</p>
      `,
    },
    {
      id: 'cross-border',
      title: 'Cross-Border Transaction Compliance',
      content: `
        <h3>1. FEMA Compliance</h3>
        <p>• All international transactions comply with FEMA regulations</p>
        <p>• Automatic forex rate application and conversion</p>
        <p>• RBI reporting for transactions above $50,000</p>
        <p>• Documentation requirements for international transfers</p>
        
        <h3>2. International Limits</h3>
        <p>• Maximum transaction limit: $50,000 equivalent</p>
        <p>• Daily international limit: $10,000</p>
        <p>• Monthly international limit: $100,000</p>
        <p>• Currency conversion fees: 2% of transaction amount</p>
        
        <h3>3. Compliance Monitoring</h3>
        <p>• Real-time transaction monitoring for suspicious activity</p>
        <p>• Automated compliance reporting to regulatory authorities</p>
        <p>• KYC verification for international transactions</p>
        <p>• Anti-money laundering (AML) compliance</p>
      `,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/wallet'
                className='p-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>←</span>
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Wallet Terms & Conditions</h1>
                <p className='text-gray-600 mt-1'>
                  Comprehensive terms for Bell24H wallet services
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className='p-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                {showDetails ? <span>👁️</span> : <span>👁️</span>}
              </button>
              <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
                <span>⬇️</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Important Notice */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8'>
            <div className='flex items-start space-x-3'>
              <AlertTriangle className='h-6 w-6 text-yellow-600 mt-1' />
              <div>
                <h3 className='text-lg font-semibold text-yellow-800 mb-2'>Important Notice</h3>
                <p className='text-yellow-700 mb-4'>
                  By using Bell24H wallet services, you agree to these terms and conditions. Please
                  read all sections carefully before proceeding. These terms are legally binding and
                  govern your use of our wallet services.
                </p>
                <div className='flex items-center space-x-4'>
                  <button
                    onClick={handleAcceptAll}
                    className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors'
                  >
                    Accept All Terms
                  </button>
                  <span className='text-sm text-yellow-600'>
                    {acceptedSections.size} of {sections.length} sections accepted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          <div className='space-y-6'>
            {sections.map(section => (
              <div
                key={section.id}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <span>📄</span>
                      <h2 className='text-xl font-semibold text-gray-900'>{section.title}</h2>
                    </div>
                    <div className='flex items-center space-x-3'>
                      {acceptedSections.has(section.id) ? (
                        <div className='flex items-center space-x-2 text-green-600'>
                          <span>✅</span>
                          <span className='text-sm font-medium'>Accepted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcceptSection(section.id)}
                          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        >
                          Accept Section
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className='p-6'>
                  <div
                    className='prose prose-gray max-w-none'
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />

                  {showDetails && (
                    <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>Legal Details</h4>
                      <ul className='text-sm text-gray-600 space-y-1'>
                        <li>• These terms are governed by Indian law</li>
                        <li>• Disputes will be resolved through arbitration in Mumbai</li>
                        <li>• Terms may be updated with 30 days notice</li>
                        <li>• Contact legal@bell24h.com for questions</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Status */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 mt-8'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Compliance Status</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>RBI Compliant</div>
                    <div className='text-sm text-gray-500'>Payment regulations</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>PCI DSS Certified</div>
                    <div className='text-sm text-gray-500'>Data security</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>GST Compliant</div>
                    <div className='text-sm text-gray-500'>Tax regulations</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>FEMA Compliant</div>
                    <div className='text-sm text-gray-500'>Foreign exchange</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8'>
            <h3 className='text-lg font-semibold text-blue-900 mb-4'>Need Help?</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div>
                <div className='font-medium text-blue-900'>Legal Support</div>
                <div className='text-blue-700'>legal@bell24h.com</div>
                <div className='text-blue-600'>+91-1800-123-4567</div>
              </div>
              <div>
                <div className='font-medium text-blue-900'>Wallet Support</div>
                <div className='text-blue-700'>wallet@bell24h.com</div>
                <div className='text-blue-600'>+91-1800-123-4568</div>
              </div>
              <div>
                <div className='font-medium text-blue-900'>Compliance Team</div>
                <div className='text-blue-700'>compliance@bell24h.com</div>
                <div className='text-blue-600'>+91-1800-123-4569</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
