'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestLoginRedirectPage() {
  const [authStatus, setAuthStatus] = useState('checking');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth-token');
        const userDataStr = localStorage.getItem('user-data');
        
        if (token && userDataStr) {
          const user = JSON.parse(userDataStr);
          setAuthStatus('authenticated');
          setUserData(user);
        } else {
          setAuthStatus('not-authenticated');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthStatus('error');
      }
    };

    checkAuth();
  }, []);

  const handleTestLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@bell24h.com',
          password: 'Demo123!'
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Store auth data
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user-data', JSON.stringify(data.user));
        
        // Test redirect
        setTimeout(() => {
          console.log('Testing redirect to dashboard...');
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login test error:', error);
      alert('Login test failed: ' + error);
    }
  };

  const handleClearAuth = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    setAuthStatus('not-authenticated');
    setUserData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login Redirect Test
        </h1>

        {/* Auth Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Authentication Status:</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            authStatus === 'authenticated' ? 'bg-green-100 text-green-800' :
            authStatus === 'not-authenticated' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {authStatus === 'authenticated' ? '✅ Authenticated' :
             authStatus === 'not-authenticated' ? '❌ Not Authenticated' :
             '⏳ Checking...'}
          </div>
        </div>

        {/* User Data */}
        {userData && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50">
            <h3 className="font-semibold mb-2">User Data:</h3>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}

        {/* Test Actions */}
        <div className="space-y-4">
          <button
            onClick={handleTestLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🧪 Test Login & Redirect
          </button>

          <button
            onClick={handleClearAuth}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            🗑️ Clear Auth Data
          </button>

          <Link
            href="/dashboard"
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
          >
            🎯 Go to Dashboard
          </Link>

          <Link
            href="/auth/login"
            className="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
          >
            🔐 Go to Login Page
          </Link>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-lg bg-yellow-50">
          <h4 className="font-semibold mb-2">Test Instructions:</h4>
          <ol className="text-sm text-gray-700 space-y-1">
            <li>1. Click "Test Login & Redirect" to simulate login</li>
            <li>2. Check console for detailed logs</li>
            <li>3. Should redirect to dashboard after 1 second</li>
            <li>4. Use "Go to Dashboard" to test direct access</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 