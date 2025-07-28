'use client';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';

export const CallToActionSection = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated ?? false;

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your business?</h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
          Join thousands of businesses already using Bell24H to connect with global partners and expand their reach.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 md:py-5 md:text-xl md:px-12 shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
          </button>
          <button
            onClick={() => router.push('/contact')}
            className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 md:py-5 md:text-xl md:px-12 shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};
