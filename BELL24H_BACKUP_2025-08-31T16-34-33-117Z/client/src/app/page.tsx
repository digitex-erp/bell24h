"use client";
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { ArrowRight, Users, Database, Eye, Search, FileText, TrendingUp, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🔔</span>
              </div>
              <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Bell24H
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 shadow-lg transition-all duration-200"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 shadow-lg transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            India's Leading{' '}
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              AI-Powered
            </span>{' '}
            B2B Marketplace
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with 5000+ verified suppliers across India's manufacturing sectors. 
            AI-powered matching, secure payments, and comprehensive business solutions.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/auth/register"
                className="px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-blue-600 text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-600">AI-powered supplier matching and intelligent RFQ processing</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">RFQ Management</h3>
            <p className="text-gray-600">Create, track, and manage Request for Quotations efficiently</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Comprehensive business insights and market intelligence</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">Razorpay integration with escrow protection</p>
          </div>
        </div>

        {/* Market Statistics */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Bell24H Market Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
                5,000+
              </div>
              <div className="text-gray-600 font-medium">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
                12,500+
              </div>
              <div className="text-gray-600 font-medium">Active RFQs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
                ₹100Cr+
              </div>
              <div className="text-gray-600 font-medium">Transaction Value</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
                98.5%
              </div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            🔧 System Status: Authentication Fixed
          </h3>
          <p className="text-blue-800 mb-6">
            The authentication system has been completely rebuilt to fix the infinite registration loop issue. 
            Users can now register, log out, and log back in successfully.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">User Registration</h4>
              <p className="text-sm text-gray-600">Multi-step registration with proper validation</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Database className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Session Management</h4>
              <p className="text-sm text-gray-600">Persistent authentication with localStorage</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Eye className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Login/Logout</h4>
              <p className="text-sm text-gray-600">Complete authentication flow working</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">🧪 How to Test the Fix:</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Register a new account with all required fields</li>
              <li>You'll be automatically logged in and redirected to dashboard</li>
              <li>Click "Logout" to sign out</li>
              <li>Try logging in with the same credentials</li>
              <li>You should successfully log back in - the loop is fixed!</li>
            </ol>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Authentication Status
          </h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Status:</span> 
              {isAuthenticated ? (
                <span className="text-green-600 ml-2 font-semibold">✅ Authenticated</span>
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Debug Panel
          </h3>
          <div className="space-y-4">
            <button
              onClick={showRegisteredUsers}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors duration-200"
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
