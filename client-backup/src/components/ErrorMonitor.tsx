'use client';

import React, { useEffect, useState } from 'react';
import { errorTracker } from '../utils/errorTracking';

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  additionalInfo?: Record<string, any>;
}

const ErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateErrors = () => {
      setErrors(errorTracker.getErrors());
    };

    // Update errors every 5 seconds
    const interval = setInterval(updateErrors, 5000);
    updateErrors(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearErrors = () => {
    errorTracker.clearErrors();
    setErrors([]);
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-red-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-800">
              Error Monitor ({errors.length})
            </h3>
            <div className="space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
              <button
                onClick={handleClearErrors}
                className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
          </div>

          <div className={`space-y-4 ${isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-32'}`}>
            {errors.map((error, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-red-700">{error.message}</p>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(error.timestamp)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{error.url}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    {error.stack && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Stack Trace:</p>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {error.componentStack && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Component Stack:</p>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {error.componentStack}
                        </pre>
                      </div>
                    )}

                    {error.additionalInfo && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Additional Info:</p>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(error.additionalInfo, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMonitor; 