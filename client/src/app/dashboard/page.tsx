'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [currentMode, setCurrentMode] = useState('buying');
  const [user, setUser] = useState<any>(null);
  const [liveStats, setLiveStats] = useState({
    activeRFQs: 23,
    pendingQuotes: 8,
    sourcingProjects: 12,
    savedSuppliers: 156,
    activeListings: 15,
    quoteRequests: 34,
    salesOpportunities: 7,
    businessConnections: 89,
  });
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user-data');

      if (!token) {
        router.push('/auth/login?redirect=/dashboard');
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      router.push('/auth/login');
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const buyingStats = [
    { label: 'Active RFQs', value: liveStats.activeRFQs, icon: '📦', color: 'blue' },
    { label: 'Pending Quotes', value: liveStats.pendingQuotes, icon: '📅', color: 'orange' },
    { label: 'Sourcing Projects', value: liveStats.sourcingProjects, icon: '📈', color: 'green' },
    { label: 'Saved Suppliers', value: liveStats.savedSuppliers, icon: '👥', color: 'purple' },
  ];

  const sellingStats = [
    { label: 'Active Listings', value: liveStats.activeListings, icon: '📦', color: 'blue' },
    { label: 'Quote Requests', value: liveStats.quoteRequests, icon: '📅', color: 'orange' },
    {
      label: 'Sales Opportunities',
      value: liveStats.salesOpportunities,
      icon: '📈',
      color: 'green',
    },
    {
      label: 'Business Connections',
      value: liveStats.businessConnections,
      icon: '👥',
      color: 'purple',
    },
  ];

  const currentStats = currentMode === 'buying' ? buyingStats : sellingStats;

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* HEADER */}
      <header className='bg-white shadow-lg border-b border-gray-200'>
        <div className='px-6 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              >
                BELL24H
              </Link>
              <div className='border-l border-gray-300 pl-4'>
                <h1 className='text-2xl font-bold text-gray-900'>Business Dashboard</h1>
                <p className='text-sm text-gray-600'>Welcome back, {user.email}</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                <span className='text-lg'>🔔</span>
              </button>
              <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                <span className='text-lg'>⚙️</span>
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='p-6'>
        {/* MODE SWITCHER */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>Business Mode</h2>
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setCurrentMode('buying')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  currentMode === 'buying'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Buying Mode
              </button>
              <button
                onClick={() => setCurrentMode('selling')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  currentMode === 'selling'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Selling Mode
              </button>
            </div>
          </div>

          <p className='text-gray-600'>
            {currentMode === 'buying'
              ? 'Source products and services from verified suppliers'
              : 'List your products and respond to buyer requirements'}
          </p>
        </div>

        {/* STATS GRID */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          {currentStats.map((stat, index) => (
            <div key={index} className='bg-white p-6 rounded-xl shadow-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{stat.label}</p>
                  <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
                </div>
                <span className={`text-2xl text-${stat.color}-600`}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h3 className='text-xl font-bold text-gray-900 mb-6'>Quick Actions</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {currentMode === 'buying' ? (
              <>
                <button className='bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors'>
                  Post New RFQ
                </button>
                <button className='bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors'>
                  Search Suppliers
                </button>
                <button className='bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors'>
                  View Analytics
                </button>
              </>
            ) : (
              <>
                <button className='bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors'>
                  Create Listing
                </button>
                <button className='bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors'>
                  Browse RFQs
                </button>
                <button className='bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors'>
                  Sales Analytics
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
