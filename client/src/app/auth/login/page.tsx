'use client';

import { useTrackUserAction } from '@/hooks/useAnalytics';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
          <div className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [formData, setFormData] = useState({ email: 'demo@bell24h.com', password: 'Demo123!' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';
  const { trackLogin } = useTrackUserAction();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Login attempt started...');
    console.log('📧 Email:', formData.email);
    console.log('🔒 Password:', formData.password);
    console.log('🎯 Redirect to:', redirectTo);

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Login successful, redirecting to:', redirectTo);
        setSuccess('Login successful! Redirecting to dashboard...');

        // Track successful login
        await trackLogin('email');

        // Store auth token
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', data.token);
          localStorage.setItem('user-data', JSON.stringify(data.user));
        }

        // Show success message and redirect
        setTimeout(() => {
          console.log('🔄 Executing redirect to:', redirectTo);
          
          // Try multiple redirect methods
          try {
            // Method 1: Use router.push
            router.push(redirectTo);
          } catch (error) {
            console.log('❌ Router redirect failed, trying window.location...');
            try {
              // Method 2: Use window.location.href
              window.location.href = redirectTo;
            } catch (error2) {
              console.log('❌ Window redirect failed, trying fallback...');
              // Method 3: Fallback to dashboard
              window.location.href = '/dashboard';
            }
          }
        }, 500); // Reduced from 1500ms to 500ms for faster redirect
      } else {
        console.log('❌ Login failed:', data.error);
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Removed Google OAuth logic
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12'>
      <div className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link
            href='/'
            className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 block'
          >
            BELL24H
          </Link>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
          <p className='text-gray-600'>Sign in to your business account</p>
        </div>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6'>
            {success}
          </div>
        )}

        {/* Google Login Button */}
        {/* Removed Google OAuth button for now */}

        <div className='relative mb-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Business Email</label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg'>
                📧
              </span>
              <input
                type='email'
                required
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='your@company.com'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg'>
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Enter your password'
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type='button'
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <span className='ml-2 text-sm text-gray-600'>Remember me</span>
            </label>
            <Link
              href='/auth/forgot-password'
              className='text-sm text-blue-600 hover:text-blue-500'
            >
              Forgot password?
            </Link>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className='mt-8 text-center'>
          <p className='text-gray-600'>
            Don't have an account?{' '}
            <Link href='/register' className='text-blue-600 hover:text-blue-500 font-semibold'>
              Create account
            </Link>
          </p>
        </div>

        <div className='mt-6 text-center'>
          <Link href='/' className='text-gray-500 hover:text-gray-700 text-sm'>
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
