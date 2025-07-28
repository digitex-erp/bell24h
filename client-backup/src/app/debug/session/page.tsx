'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

export default function SessionDebugPage() {
  const { data: session, status } = useSession();
  const [cookieInfo, setCookieInfo] = useState<Record<string, any>>({});
  
  // Get cookie info
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    setCookieInfo(cookies);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-indigo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Session Debugging Tool
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">
              Current session and cookie information for troubleshooting
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              {/* Session Status */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Session Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'authenticated' 
                      ? 'bg-green-100 text-green-800' 
                      : status === 'unauthenticated'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status}
                  </span>
                </dd>
              </div>
              
              {/* Session Data */}
              {session && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Session Data</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
              
              {/* Cookie Info */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Cookies</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {Object.entries(cookieInfo).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <strong>{key}</strong>: {value}<br />
                      </React.Fragment>
                    ))}
                  </pre>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
