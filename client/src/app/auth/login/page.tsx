'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [configError, setConfigError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fix URL decoding issue - handle both encoded and plain URLs
  const redirectParam = searchParams?.get('redirect') || '/dashboard';
  const redirectTo = decodeURIComponent(redirectParam);

  useEffect(() => {
    try {
      const client = createClientComponentClient();
      setSupabase(client);

      // Check if user is already authenticated
      const checkAuthAndRedirect = async () => {
        const {
          data: { session },
        } = await client.auth.getSession();
        if (session) {
          console.log('User already authenticated, redirecting to:', redirectTo);
          router.push(redirectTo);
        }
      };
      checkAuthAndRedirect();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      setConfigError(
        'Authentication service is not properly configured. Please check your environment variables.'
      );
    }
  }, [router, redirectTo]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!supabase) {
      setError('Authentication service is not available. Please check your configuration.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isRegister) {
        // Handle registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `https://bell24h-v1.vercel.app${redirectTo}`,
            data: {
              role: 'buyer',
              name: email.split('@')[0],
            },
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.user && !data.session) {
          // Email confirmation required
          setError('');
          alert(
            '✅ Registration successful! Please check your email and click the confirmation link.'
          );
        } else if (data.session) {
          // Immediate session - redirect automatically
          console.log('Registration successful, redirecting to:', redirectTo);
          router.push(redirectTo);
        }
      } else {
        // Handle login with AUTOMATIC redirect
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.user) {
          console.log('Login successful, redirecting to:', redirectTo);

          // Store user data
          localStorage.setItem(
            'bell24h-user',
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              role: data.user.user_metadata?.role || 'buyer',
              name: data.user.user_metadata?.name || data.user.email,
            })
          );

          // AUTOMATIC redirect - no manual buttons needed
          setTimeout(() => {
            router.push(redirectTo);
          }, 500); // Small delay for better UX
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      console.error('❌ Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state with automatic redirect
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            {isRegister ? 'Creating Account...' : 'Signing In...'}
          </h3>
          <p className='text-gray-600 text-sm'>
            {isRegister ? 'Setting up your Bell24h account' : 'Redirecting to your dashboard'}
          </p>
        </div>
      </div>
    );
  }

  // Show configuration error if Supabase is not properly configured
  if (configError) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4'>
        <div className='max-w-md w-full'>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6'>
              <span className='text-white font-bold text-2xl'>B</span>
            </div>
            <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2'>
              BELL24H
            </h1>
          </div>

          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <div className='text-red-400 mr-3'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-red-800 font-semibold mb-2'>Configuration Error</h3>
                  <p className='text-red-800 text-sm'>{configError}</p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-900'>To fix this issue:</h3>
              <ol className='list-decimal list-inside text-sm text-gray-700 space-y-2'>
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to Settings → API</li>
                <li>Copy your Project URL and Anon Key</li>
                <li>
                  Update your <code className='bg-gray-100 px-1 rounded'>.env.local</code> file with
                  these values
                </li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        {/* Header */}
        <div className='text-center mb-8'>
          <Link href='/' className='inline-block mb-6'>
            <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-2xl'>B</span>
            </div>
          </Link>
          <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2'>
            BELL24H
          </h1>
          <p className='text-sm text-gray-600 mt-2 font-medium'>
            India's First AI-Powered B2B Marketplace
          </p>
          <h2 className='text-2xl font-bold text-gray-900 mt-4 mb-2'>
            {isRegister ? 'Create Business Account' : 'Welcome Back'}
          </h2>
          <p className='text-gray-600'>
            {isRegister
              ? 'Join thousands of businesses on Bell24h'
              : 'Sign in to access your AI-powered dashboard'}
          </p>
        </div>

        {/* Login Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          {/* Error Message */}
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <div className='text-red-400 mr-3'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <p className='text-red-800 text-sm'>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className='space-y-6'>
            {/* Email Input */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Business Email
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='your.email@company.com'
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder={isRegister ? 'Create secure password' : 'Enter password'}
                disabled={isLoading}
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className='flex items-center justify-between'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='ml-2 text-sm text-gray-600'>Remember me</span>
              </label>
              {!isRegister && (
                <Link
                  href='/auth/forgot-password'
                  className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                >
                  Forgot password?
                </Link>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading || !email || !password}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading || !email || !password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v8l4-4H4z'
                    ></path>
                  </svg>
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : isRegister ? (
                '🚀 Create Account'
              ) : (
                '🔐 Access Dashboard'
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-3'>
                {isRegister ? 'Already have an account?' : 'New to Bell24h?'}
              </p>
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors'
              >
                {isRegister ? 'Sign in instead' : 'Create Account'}
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <div className='text-center'>
              <p className='text-xs text-gray-500 mb-3'>🔒 Enterprise-grade security & privacy</p>
              {isRegister && (
                <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
                  <div className='flex items-center justify-center'>
                    <span className='text-green-500 mr-1'>✓</span>
                    AI Matching
                  </div>
                  <div className='flex items-center justify-center'>
                    <span className='text-green-500 mr-1'>✓</span>
                    Voice RFQ
                  </div>
                  <div className='flex items-center justify-center'>
                    <span className='text-green-500 mr-1'>✓</span>
                    24/7 Support
                  </div>
                  <div className='flex items-center justify-center'>
                    <span className='text-green-500 mr-1'>✓</span>
                    Free Trial
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
          <div className='bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Loading...</h3>
            <p className='text-gray-600 text-sm'>Preparing login page</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
