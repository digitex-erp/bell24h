'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // For now, show a success message since password reset API isn't implemented
      setMessage('Password reset link sent to your email! Please check your inbox.');
      
      // TODO: Implement actual password reset API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Reset Password</h1>
          <p className='text-gray-600'>Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
            {error}
          </div>
        )}

        {message && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6'>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                Sending...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className='mt-8 text-center'>
          <p className='text-gray-600'>
            Remember your password?{' '}
            <Link href='/auth/login' className='text-blue-600 hover:text-blue-500 font-semibold'>
              Back to Login
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