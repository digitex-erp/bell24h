'use client';

import { useState, useEffect } from 'react';

export default function TestLivePage() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: any = {};
    
    try {
      // Test 1: Categories API
      try {
        const categoriesRes = await fetch('/api/categories');
        results.categories = {
          status: categoriesRes.ok ? 'PASS' : 'FAIL',
          data: categoriesRes.ok ? await categoriesRes.json() : null
        };
      } catch (error) {
        results.categories = { status: 'FAIL', error: error.message };
      }

      // Test 2: Suppliers API
      try {
        const suppliersRes = await fetch('/api/suppliers');
        results.suppliers = {
          status: suppliersRes.ok ? 'PASS' : 'FAIL',
          data: suppliersRes.ok ? await suppliersRes.json() : null
        };
      } catch (error) {
        results.suppliers = { status: 'FAIL', error: error.message };
      }

      // Test 3: Admin Analytics API
      try {
        const analyticsRes = await fetch('/api/admin/analytics');
        results.analytics = {
          status: analyticsRes.ok ? 'PASS' : 'FAIL',
          data: analyticsRes.ok ? await analyticsRes.json() : null
        };
      } catch (error) {
        results.analytics = { status: 'FAIL', error: error.message };
      }

      // Test 4: Admin Users API
      try {
        const usersRes = await fetch('/api/admin/users');
        results.users = {
          status: usersRes.ok ? 'PASS' : 'FAIL',
          data: usersRes.ok ? await usersRes.json() : null
        };
      } catch (error) {
        results.users = { status: 'FAIL', error: error.message };
      }

    } catch (error) {
      results.general = { status: 'FAIL', error: error.message };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running live functionality tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Live Functionality Test Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(testResults).map(([key, result]: [string, any]) => (
            <div key={key} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="feature-title capitalize">{key} API</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.status === 'PASS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {result.status === 'PASS' ? (
                <div>
                  <p className="text-green-600 mb-2">✅ API is working correctly</p>
                  {result.data && (
                    <div className="text-sm text-gray-600">
                      <p>Data received: {JSON.stringify(result.data).length} characters</p>
                      {key === 'categories' && result.data.categories && (
                        <p>Categories: {result.data.categories.length}</p>
                      )}
                      {key === 'suppliers' && result.data.suppliers && (
                        <p>Suppliers: {result.data.suppliers.length}</p>
                      )}
                      {key === 'analytics' && result.data.metrics && (
                        <p>Total Users: {result.data.metrics.totalUsers}</p>
                      )}
                      {key === 'users' && result.data.users && (
                        <p>Users: {result.data.users.length}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600 mb-2">❌ API failed</p>
                  <p className="text-sm text-gray-600">Error: {result.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="feature-title mb-4">Test Summary</h2>
          <div className="space-y-2">
            {Object.entries(testResults).map(([key, result]: [string, any]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={result.status === 'PASS' ? 'text-green-500' : 'text-red-500'}>
                  {result.status === 'PASS' ? '✅' : '❌'}
                </span>
                <span className="capitalize">{key} API</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If all tests PASS: Your site is fully functional!</li>
              <li>• If any tests FAIL: Check database connection and environment variables</li>
              <li>• Visit /marketplace and /suppliers to test the live pages</li>
              <li>• Visit /admin to test the admin dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
