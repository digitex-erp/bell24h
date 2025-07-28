'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestDashboardPage() {
  const [authStatus, setAuthStatus] = useState('checking');
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userDataStr = localStorage.getItem('user-data');

      if (token && userDataStr) {
        setUserData(JSON.parse(userDataStr));
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('not-authenticated');
      }
    }
  }, []);

  const handleLogin = () => {
    router.push('/auth/login?redirect=/test-dashboard');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleClearAuth = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    setAuthStatus('not-authenticated');
    setUserData(null);
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Access Test</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Authentication Status</h2>
              <p className="text-blue-800">
                Status: <span className="font-semibold">{authStatus}</span>
              </p>
            </div>

            {userData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-900 mb-2">User Data</h2>
                <pre className="text-sm text-green-800 overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {authStatus === 'not-authenticated' ? (
                  <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Login to Test
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGoToDashboard}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={handleClearAuth}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                      Clear Authentication
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Test Instructions</h2>
              <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                <li>If not authenticated, click "Login to Test"</li>
                <li>Login with demo@bell24h.com / Demo123!</li>
                <li>You should be redirected back here</li>
                <li>Click "Go to Dashboard" to test dashboard access</li>
                <li>If dashboard works, the redirect issue is in the login flow</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 