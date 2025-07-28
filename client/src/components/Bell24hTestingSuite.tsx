'use client';

import { useState } from 'react';

export default function Bell24hTestingSuite() {
  const [tests, setTests] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test Configuration
  const BASE_URL = 'https://bell24h-v1-rmiydi1cb-vishaals-projects-892b178d.vercel.app';

  const TEST_USERS = {
    new: {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User',
      companyName: 'Test Company Ltd',
    },
    existing: {
      email: 'demo@bell24h.com',
      password: 'Demo123!',
    },
    invalid: {
      email: 'invalid-email',
      password: '123',
      name: '',
      companyName: '',
    },
  };

  const updateTestResult = (testName, status, message, details = null) => {
    const result = {
      testName,
      status, // 'pass', 'fail', 'running'
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
    };

    setTestResults(prev => {
      const filtered = prev.filter(r => r.testName !== testName);
      return [...filtered, result];
    });
  };

  // Test Functions
  const testRegistrationFlow = async () => {
    setCurrentTest('Registration Flow');

    try {
      updateTestResult('Registration Flow', 'running', 'Testing user registration...');

      // Test 1: Valid Registration
      const validRegResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USERS.new),
      });

      const validRegData = await validRegResponse.json();

      if (validRegResponse.ok && validRegData.success) {
        updateTestResult(
          'Valid Registration',
          'pass',
          'User registration successful',
          validRegData
        );
      } else {
        updateTestResult(
          'Valid Registration',
          'fail',
          `Registration failed: ${validRegData.message}`,
          validRegData
        );
        return;
      }

      // Test 2: Duplicate Email Registration
      const duplicateResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USERS.new),
      });

      const duplicateData = await duplicateResponse.json();

      if (!duplicateResponse.ok && duplicateData.message.includes('already exists')) {
        updateTestResult(
          'Duplicate Email Prevention',
          'pass',
          'Duplicate email properly rejected',
          duplicateData
        );
      } else {
        updateTestResult(
          'Duplicate Email Prevention',
          'fail',
          'Duplicate email not properly handled',
          duplicateData
        );
      }

      // Test 3: Invalid Data Validation
      const invalidResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USERS.invalid),
      });

      const invalidData = await invalidResponse.json();

      if (!invalidResponse.ok) {
        updateTestResult(
          'Invalid Data Validation',
          'pass',
          'Invalid data properly rejected',
          invalidData
        );
      } else {
        updateTestResult(
          'Invalid Data Validation',
          'fail',
          'Invalid data was accepted',
          invalidData
        );
      }

      updateTestResult(
        'Registration Flow',
        'pass',
        'All registration tests completed successfully'
      );
    } catch (error) {
      updateTestResult(
        'Registration Flow',
        'fail',
        `Registration test failed: ${error.message}`,
        error
      );
    }
  };

  const testLoginFlow = async () => {
    setCurrentTest('Login Flow');

    try {
      updateTestResult('Login Flow', 'running', 'Testing user login...');

      // Test 1: Valid Login
      const validLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USERS.existing),
      });

      const validLoginData = await validLoginResponse.json();

      if (validLoginResponse.ok && validLoginData.success) {
        updateTestResult('Valid Login', 'pass', 'User login successful', validLoginData);
      } else {
        updateTestResult(
          'Valid Login',
          'fail',
          `Login failed: ${validLoginData.message}`,
          validLoginData
        );
        return;
      }

      // Test 2: Invalid Credentials
      const invalidLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USERS.existing.email,
          password: 'wrongpassword',
        }),
      });

      const invalidLoginData = await invalidLoginResponse.json();

      if (!invalidLoginResponse.ok && invalidLoginData.message.includes('Invalid')) {
        updateTestResult(
          'Invalid Credentials',
          'pass',
          'Invalid credentials properly rejected',
          invalidLoginData
        );
      } else {
        updateTestResult(
          'Invalid Credentials',
          'fail',
          'Invalid credentials were accepted',
          invalidLoginData
        );
      }

      // Test 3: Missing Fields
      const missingFieldsResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_USERS.existing.email }),
      });

      const missingFieldsData = await missingFieldsResponse.json();

      if (!missingFieldsResponse.ok) {
        updateTestResult(
          'Missing Fields Validation',
          'pass',
          'Missing fields properly handled',
          missingFieldsData
        );
      } else {
        updateTestResult(
          'Missing Fields Validation',
          'fail',
          'Missing fields were accepted',
          missingFieldsData
        );
      }

      updateTestResult('Login Flow', 'pass', 'All login tests completed successfully');
    } catch (error) {
      updateTestResult('Login Flow', 'fail', `Login test failed: ${error.message}`, error);
    }
  };

  const testPageAccess = async () => {
    setCurrentTest('Page Access Testing');

    const pagesToTest = [
      { url: `${BASE_URL}`, name: 'Homepage', expectedStatus: 200 },
      { url: `${BASE_URL}/auth/login`, name: 'Login Page', expectedStatus: 200 },
      { url: `${BASE_URL}/auth/register`, name: 'Register Page', expectedStatus: 200 },
      { url: `${BASE_URL}/supplier/dashboard`, name: 'Supplier Dashboard', expectedStatus: 200 },
      { url: `${BASE_URL}/buyer/rfq/create`, name: 'RFQ Creation', expectedStatus: 200 },
      { url: `${BASE_URL}/buyer/suppliers`, name: 'Supplier Discovery', expectedStatus: 200 },
      { url: `${BASE_URL}/buyer/orders`, name: 'Order Management', expectedStatus: 200 },
      { url: `${BASE_URL}/buyer/analytics`, name: 'Buyer Analytics', expectedStatus: 200 },
    ];

    updateTestResult(
      'Page Access Testing',
      'running',
      `Testing access to ${pagesToTest.length} pages...`
    );

    for (const page of pagesToTest) {
      try {
        const response = await fetch(page.url);

        if (response.status === page.expectedStatus) {
          updateTestResult(
            `Page: ${page.name}`,
            'pass',
            `${page.name} accessible (${response.status})`,
            { url: page.url }
          );
        } else {
          updateTestResult(
            `Page: ${page.name}`,
            'fail',
            `${page.name} returned ${response.status}, expected ${page.expectedStatus}`,
            { url: page.url }
          );
        }
      } catch (error) {
        updateTestResult(
          `Page: ${page.name}`,
          'fail',
          `${page.name} failed to load: ${error.message}`,
          { url: page.url, error }
        );
      }
    }

    updateTestResult('Page Access Testing', 'pass', 'Page access testing completed');
  };

  const testApiEndpoints = async () => {
    setCurrentTest('API Endpoint Testing');

    const apisToTest = [
      { url: `${BASE_URL}/api/health`, method: 'GET', name: 'Health Check' },
      { url: `${BASE_URL}/api/products`, method: 'GET', name: 'Products API' },
      { url: `${BASE_URL}/api/categories`, method: 'GET', name: 'Categories API' },
      { url: `${BASE_URL}/api/homepage-stats`, method: 'GET', name: 'Homepage Stats' },
    ];

    updateTestResult(
      'API Endpoint Testing',
      'running',
      `Testing ${apisToTest.length} API endpoints...`
    );

    for (const api of apisToTest) {
      try {
        const response = await fetch(api.url, { method: api.method });
        const data = await response.json();

        if (response.ok) {
          updateTestResult(`API: ${api.name}`, 'pass', `${api.name} API working`, {
            status: response.status,
            data,
          });
        } else {
          updateTestResult(
            `API: ${api.name}`,
            'fail',
            `${api.name} API failed (${response.status})`,
            { status: response.status, data }
          );
        }
      } catch (error) {
        updateTestResult(`API: ${api.name}`, 'fail', `${api.name} API error: ${error.message}`, {
          error,
        });
      }
    }

    updateTestResult('API Endpoint Testing', 'pass', 'API endpoint testing completed');
  };

  const testDatabaseConnection = async () => {
    setCurrentTest('Database Testing');

    try {
      updateTestResult('Database Testing', 'running', 'Testing database connection...');

      // Test database debug endpoint
      const dbResponse = await fetch(`${BASE_URL}/api/debug-db`);

      if (dbResponse.ok) {
        const dbData = await dbResponse.json();

        if (dbData.status === 'HEALTHY' || dbData.ready_for_registration) {
          updateTestResult('Database Connection', 'pass', 'Database is healthy and ready', dbData);
        } else {
          updateTestResult('Database Connection', 'fail', 'Database has issues', dbData);
        }
      } else {
        updateTestResult('Database Connection', 'fail', 'Database debug endpoint failed', {
          status: dbResponse.status,
        });
      }

      updateTestResult('Database Testing', 'pass', 'Database testing completed');
    } catch (error) {
      updateTestResult('Database Testing', 'fail', `Database test failed: ${error.message}`, error);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      await testDatabaseConnection();
      await testApiEndpoints();
      await testPageAccess();
      await testRegistrationFlow();
      await testLoginFlow();

      // Final summary
      const passedTests = testResults.filter(r => r.status === 'pass').length;
      const failedTests = testResults.filter(r => r.status === 'fail').length;
      const totalTests = passedTests + failedTests;

      updateTestResult(
        'Test Suite Summary',
        passedTests === totalTests ? 'pass' : 'fail',
        `Completed: ${passedTests}/${totalTests} tests passed`,
        { passed: passedTests, failed: failedTests, total: totalTests }
      );
    } catch (error) {
      updateTestResult('Test Suite', 'fail', `Test suite failed: ${error.message}`, error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'fail':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'running':
        return '⏳';
      default:
        return '⚪';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>🧪 Bell24h E2E Testing Suite</h1>
          <p className='text-gray-600 mb-6'>
            Comprehensive end-to-end testing for registration, login, and all major features
          </p>

          {/* Test Controls */}
          <div className='flex flex-wrap gap-4 mb-6'>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </button>

            <button
              onClick={testRegistrationFlow}
              disabled={isRunning}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
            >
              📝 Test Registration
            </button>

            <button
              onClick={testLoginFlow}
              disabled={isRunning}
              className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50'
            >
              🔐 Test Login
            </button>

            <button
              onClick={testPageAccess}
              disabled={isRunning}
              className='px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50'
            >
              🌐 Test Pages
            </button>

            <button
              onClick={testApiEndpoints}
              disabled={isRunning}
              className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50'
            >
              🔌 Test APIs
            </button>
          </div>

          {/* Current Test Status */}
          {currentTest && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <div className='flex items-center'>
                <div className='animate-spin mr-3'>⏳</div>
                <span className='font-medium'>Currently running: {currentTest}</span>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-gray-800'>Test Results</h2>

            {testResults.length === 0 && !isRunning && (
              <div className='text-center py-8 text-gray-500'>
                No tests run yet. Click "Run All Tests" to start comprehensive testing.
              </div>
            )}

            {testResults.map((result, index) => (
              <div
                key={`${result.testName}-${index}`}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <span className='mr-3'>{getStatusIcon(result.status)}</span>
                    <div>
                      <h3 className='font-medium'>{result.testName}</h3>
                      <p className='text-sm'>{result.message}</p>
                      <span className='text-xs opacity-75'>{result.timestamp}</span>
                    </div>
                  </div>

                  {result.details && (
                    <details className='ml-4'>
                      <summary className='cursor-pointer text-xs'>Details</summary>
                      <pre className='text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32'>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Test Configuration */}
          <div className='mt-8 bg-gray-50 rounded-lg p-4'>
            <h3 className='font-medium text-gray-800 mb-2'>Test Configuration</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <strong>Base URL:</strong> {BASE_URL}
              </div>
              <div>
                <strong>Test User Email:</strong> {TEST_USERS.new.email}
              </div>
              <div>
                <strong>Demo User:</strong> {TEST_USERS.existing.email}
              </div>
              <div>
                <strong>Total Test Cases:</strong> 15+ comprehensive tests
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
