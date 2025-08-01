'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL parameters
        const code = searchParams?.get('code');
        const next = searchParams?.get('next') || '/dashboard';

        if (!code) {
          setError('No authentication code found in URL');
          setIsProcessing(false);
          return;
        }

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setIsProcessing(false);
          return;
        }

        // Success - redirect to dashboard
        console.log('Email confirmation successful, redirecting to dashboard');
        router.push(next);
      } catch (error) {
        console.error('Auth callback processing error:', error);
        setError('Failed to process authentication. Please try again.');
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase.auth]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">!</span>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2">
              Authentication Error
            </h1>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            BELL24H
          </h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Confirming your email...' : 'Redirecting...'}
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 