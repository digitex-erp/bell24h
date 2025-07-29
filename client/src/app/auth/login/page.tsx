'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('digitex.studio@gmail.com');
  const [password, setPassword] = useState('Gold#1212');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting to dashboard...');
        
        // Store user data in localStorage for immediate access
        if (data.user) {
          localStorage.setItem('bell24h-user', JSON.stringify(data.user));
          localStorage.setItem('auth-token', data.token);
        }
        
        console.log('✅ Login successful, starting redirect...');
        
        // Multiple redirect methods with detailed logging
        const redirectToDashboard = () => {
          const dashboardUrl = '/dashboard';
          
          console.log('🔄 Attempting redirect to:', dashboardUrl);
          
          // Method 1: Next.js router (preferred)
          try {
            router.push(dashboardUrl);
            console.log('✅ Router.push executed');
          } catch (routerError) {
            console.error('❌ Router.push failed:', routerError);
          }
          
          // Method 2: Window location (backup after 1 second)
          setTimeout(() => {
            if (window.location.pathname.includes('/auth/login')) {
              console.log('🔄 Router.push didn\'t work, trying window.location.href');
              window.location.href = dashboardUrl;
            }
          }, 1000);
          
          // Method 3: Force reload and redirect (final backup after 2 seconds)
          setTimeout(() => {
            if (window.location.pathname.includes('/auth/login')) {
              console.log('🔄 window.location.href didn\'t work, trying window.location.replace');
              window.location.replace(dashboardUrl);
            }
          }, 2000);
          
          // Method 4: Ultimate fallback (after 3 seconds)
          setTimeout(() => {
            if (window.location.pathname.includes('/auth/login')) {
              console.log('🚨 All redirects failed, forcing manual redirect');
              window.location.assign(dashboardUrl);
            }
          }, 3000);
        };

        // Start redirect immediately
        redirectToDashboard();
        
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
        console.error('❌ Login failed:', data.error);
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      console.error('❌ Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Quick test function for direct dashboard access
  const testDashboardAccess = () => {
    console.log('🧪 Testing direct dashboard access...');
    window.open('/dashboard', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            BELL24H
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your business account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Success Message with Manual Link */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="text-green-400 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-800 text-sm font-medium">{success}</p>
              </div>
              
              {/* Manual redirect options if auto-redirect fails */}
              <div className="mt-3 space-y-2">
                <Link 
                  href="/dashboard"
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  🚀 Go to Dashboard Now
                </Link>
                
                <button
                  onClick={testDashboardAccess}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                >
                  🧪 Test Dashboard (New Tab)
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your business email"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading || !email || !password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8l4-4H4z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">
                Don't have a business account?
              </p>
              <Link
                href="/register"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Access Panel */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">🚀 Quick Access</h3>
          <div className="space-y-2">
            <Link 
              href="/dashboard"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Direct Dashboard Access
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/marketplace"
                className="text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-xs transition-colors"
              >
                Marketplace
              </Link>
              <Link 
                href="/rfq/create"
                className="text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-xs transition-colors"
              >
                Create RFQ
              </Link>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-xs font-semibold text-yellow-800 mb-2">🔧 Debug Info</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p>Environment: {process.env.NODE_ENV}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
