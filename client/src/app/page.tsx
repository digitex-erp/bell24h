"use client";
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { ArrowRight, Users, Database, Eye } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  // Debug function to show registered users
  const showRegisteredUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem('bell24h_users') || '[]');
      console.log('Registered users:', users);
      alert(`Registered users: ${users.length}\n${users.map(u => u.email).join('\n')}`);
    } catch (error) {
      console.error('Error reading users:', error);
      alert('Error reading registered users');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔔</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Bell24H</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            India's AI-Powered B2B Marketplace
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with suppliers and buyers across India's manufacturing sectors
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/register"
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Authentication Fix Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            🔧 Critical Authentication Fix Deployed
          </h3>
          <p className="text-blue-800 mb-6">
            The authentication system has been completely rebuilt to fix the infinite registration loop issue. 
            Users can now register, log out, and log back in successfully.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">User Registration</h4>
              <p className="text-sm text-gray-600">Multi-step registration with proper validation</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <Database className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Session Management</h4>
              <p className="text-sm text-gray-600">Persistent authentication with localStorage</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <Eye className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Login/Logout</h4>
              <p className="text-sm text-gray-600">Complete authentication flow working</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🧪 How to Test the Fix:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Register a new account with all required fields</li>
              <li>You'll be automatically logged in and redirected to dashboard</li>
              <li>Click "Logout" to sign out</li>
              <li>Try logging in with the same credentials</li>
              <li>You should successfully log back in - the loop is fixed!</li>
            </ol>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Authentication Status
          </h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Status:</span> 
              {isAuthenticated ? (
                <span className="text-green-600 ml-2">✅ Authenticated</span>
              ) : (
                <span className="text-gray-600 ml-2">❌ Not authenticated</span>
              )}
            </p>
            {isAuthenticated && user && (
              <p className="text-sm">
                <span className="font-medium">User:</span> 
                <span className="text-gray-600 ml-2">{user.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Debug Panel
          </h3>
          <div className="space-y-4">
            <button
              onClick={showRegisteredUsers}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Show Registered Users (Console)
            </button>
            <div className="text-xs text-gray-600">
              <p>This will show all registered users in the browser console and alert.</p>
              <p>Use this to verify that user registration is working correctly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
