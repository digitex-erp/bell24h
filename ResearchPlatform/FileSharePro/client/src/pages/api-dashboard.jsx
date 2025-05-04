/**
 * API Dashboard Page
 * 
 * This page demonstrates the integration with external APIs
 * and shows the various components that use them.
 */

import React from 'react';
import ApiStatus from '../components/api-status';
import TradingWidget from '../components/trading-widget';
import FsatDashboard from '../components/fsat-dashboard';

const ApiDashboard = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bell24h External API Integration</h1>
          <p className="mt-2 text-lg text-gray-600">
            Monitoring and interacting with connected financial services
          </p>
        </header>
        
        <div className="mb-8">
          <ApiStatus />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <TradingWidget />
          <FsatDashboard />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">External API Integration Notes</h2>
          
          <div className="prose prose-sm">
            <p>
              The Bell24h platform integrates with multiple external financial services APIs to provide
              a comprehensive trading and financial experience for users.
            </p>
            
            <h3>Integrated Services</h3>
            <ul>
              <li><strong>FSAT API</strong> - Core trading and financial services</li>
              <li><strong>Kotak Securities API</strong> - Market data and trading</li>
              <li><strong>KredX API</strong> - Invoice discounting and vendor management</li>
              <li><strong>RazorpayX API</strong> - Payment processing and banking operations</li>
            </ul>
            
            <h3>Configuration Requirements</h3>
            <p>
              Each API requires specific environment variables to be set for authentication.
              Please see the <code>EXTERNAL_API_INTEGRATION.md</code> document for details.
            </p>
            
            <h3>Current Status</h3>
            <p>
              This dashboard displays the integration status and demonstrates the functionality
              of each API. In development mode, placeholder data is used when the actual API
              credentials are not configured.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
              <strong>Note:</strong> For production use, please ensure all API credentials are properly
              configured with valid accounts from each provider.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDashboard;