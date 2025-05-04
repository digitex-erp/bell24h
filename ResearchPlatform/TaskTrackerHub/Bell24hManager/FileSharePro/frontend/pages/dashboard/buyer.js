import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import WalletWidget from '../../components/WalletWidget';
import { webSocketClient } from '../../lib/websocket';

export default function BuyerDashboard({ auth }) {
  const router = useRouter();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchRfqs = async () => {
      try {
        const response = await fetch('/api/rfq/buyer');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch RFQs');
        }
        
        setRfqs(data);
      } catch (error) {
        console.error('Error fetching RFQs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.isAuthenticated) {
      fetchRfqs();
      
      // Set up WebSocket listener for RFQ updates
      webSocketClient.connect();
      
      webSocketClient.on('rfq_update', (data) => {
        setRfqs(prev => {
          // Find the RFQ in the current list
          const index = prev.findIndex(rfq => rfq.id === data.id);
          
          if (index !== -1) {
            // Replace the updated RFQ
            const updated = [...prev];
            updated[index] = data;
            return updated;
          }
          
          return prev;
        });
      });
      
      webSocketClient.on('new_bid', (data) => {
        setRfqs(prev => {
          // Find the RFQ that received a new bid
          const index = prev.findIndex(rfq => rfq.id === data.rfq_id);
          
          if (index !== -1) {
            // Update bid count
            const updated = [...prev];
            updated[index].bid_count = (updated[index].bid_count || 0) + 1;
            return updated;
          }
          
          return prev;
        });
      });
    }
    
    return () => {
      webSocketClient.off('rfq_update');
      webSocketClient.off('new_bid');
    };
  }, [auth.isAuthenticated, auth.loading, router]);
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatus = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };
  
  if (auth.loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Buyer Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => router.push('/rfq/create')}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create New RFQ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your RFQs
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage all your Request for Quotations
                </p>
              </div>
              
              {error && (
                <div className="px-4 py-5 sm:px-6">
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error loading RFQs
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="px-4 py-5 sm:px-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {rfqs.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      You haven't created any RFQs yet. Click "Create New RFQ" to get started.
                    </li>
                  ) : (
                    rfqs.map((rfq) => (
                      <li key={rfq.id}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-primary-600 truncate">
                                {rfq.title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(rfq.status)}`}>
                                  {formatStatus(rfq.status)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Budget: ₹{rfq.budget.toLocaleString()}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <svg
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Delivery: {rfq.delivery_days} days
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {rfq.bid_count || 0} {rfq.bid_count === 1 ? 'bid' : 'bids'}
                              </div>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => router.push(`/rfq/${rfq.id}`)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
          
          <div>
            <WalletWidget />
            
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Stats
                </h3>
                
                {loading ? (
                  <div className="animate-pulse mt-4 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <dl className="mt-5 grid grid-cols-1 gap-5">
                    <div className="overflow-hidden">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active RFQs
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {rfqs.filter(rfq => rfq.status === 'open' || rfq.status === 'in_progress').length}
                      </dd>
                    </div>
                    <div className="overflow-hidden">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed RFQs
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {rfqs.filter(rfq => rfq.status === 'completed').length}
                      </dd>
                    </div>
                    <div className="overflow-hidden">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Suppliers Worked With
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {/* This would normally be calculated from your backend data */}
                        {Math.min(rfqs.filter(rfq => rfq.status === 'completed').length * 2, 15)}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
