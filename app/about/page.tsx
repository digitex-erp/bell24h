import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Bell24h',
  description: 'Learn about Bell24h B2B marketplace'
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          About Bell24h
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Bell24h is India's premier B2B marketplace, connecting businesses across the country
              to facilitate seamless trade and commerce. We believe in empowering businesses with
              technology-driven solutions that make procurement and supply chain management efficient,
              transparent, and profitable.
            </p>

            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-gray-600 mb-6">
              We provide a comprehensive platform where buyers and suppliers can discover each other,
              negotiate deals, and complete transactions with confidence. Our AI-powered matching system
              ensures that businesses find the right partners for their specific needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                AI-powered supplier matching based on your requirements, quality standards, and preferences
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">
                End-to-end encryption and secure payment processing for all B2B transactions
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">
                Comprehensive analytics and market insights to help you make informed business decisions
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in all business dealings, pricing, and processes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Continuous innovation in technology and processes to serve our customers better.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Trust</h3>
                <p className="text-gray-600">
                  Building trust through verified suppliers, secure payments, and reliable service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Growth</h3>
                <p className="text-gray-600">
                  Committed to the growth and success of every business that partners with us.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Rajesh Kumar</h3>
                <p className="text-gray-600">CEO & Founder</p>
                <p className="text-sm text-gray-500 mt-2">
                  15+ years in B2B commerce and technology
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Priya Sharma</h3>
                <p className="text-gray-600">CTO</p>
                <p className="text-sm text-gray-500 mt-2">
                  Expert in AI and machine learning technologies
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Amit Patel</h3>
                <p className="text-gray-600">Head of Operations</p>
                <p className="text-sm text-gray-500 mt-2">
                  Supply chain and logistics specialist
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
