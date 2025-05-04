/**
 * API Status Component
 * 
 * This component displays the status of all external API integrations
 * and provides information about their configuration.
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ApiStatus = () => {
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/external/status');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setStatus({
          loading: false,
          error: null,
          data
        });
      } catch (error) {
        setStatus({
          loading: false,
          error: error.message,
          data: null
        });
      }
    };

    fetchStatus();
  }, []);

  if (status.loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">API Status Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{status.error}</p>
        <button 
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const { apis = [] } = status.data || {};
  const configuredCount = apis.filter(api => api.configured).length;
  const allConfigured = configuredCount === apis.length && apis.length > 0;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">External API Status</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${allConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {configuredCount} of {apis.length} configured
        </span>
      </div>

      <div className="space-y-3">
        {apis.map((api, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center">
              {api.configured ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">{api.name}</span>
            </div>
            <span className={`text-sm ${api.configured ? 'text-green-600' : 'text-red-600'}`}>
              {api.configured ? 'Ready' : 'Not Configured'}
            </span>
          </div>
        ))}
      </div>

      {!allConfigured && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
          <p className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Some APIs are not configured. Please check your environment variables.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiStatus;