import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import WalletWidget from '../../components/WalletWidget';
import { webSocketClient } from '../../lib/websocket';

export default function SupplierDashboard({ auth }) {
  const router = useRouter();
  const [activeRfqs, setActiveRfqs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    completion_rate: 0,
    avg_rating: 0,
    avg_delivery_days: 0,
    total_completed: 0,
  });
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        // Fetch active RFQs
        const rfqResponse = await fetch('/api/rfq/active');
        const rfqData = await rfqResponse.json();
        
        if (!rfqResponse.ok) {
          throw new Error(rfqData.message || 'Failed to fetch active RFQs');
        }
        
        setActiveRfqs(rfqData);
        
        // Fetch supplier's bids
        const bidsResponse = await fetch('/api/supplier/bids');
        const bidsData = await bidsResponse.json();
        
        if (!bidsResponse.ok) {
          throw new Error(bidsData.message || 'Failed to fetch bids');
        }
        
        setMyBids(bidsData);
        
        // Fetch supplier metrics
        const metricsResponse = await fetch('/api/supplier/metrics');
        const metricsData = await metricsResponse.json();
        
        if (!metricsResponse.ok) {
          throw new Error(metricsData.message || 'Failed to fetch supplier metrics');
        }
        
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.isAuthenticated) {
      fetchDashboardData();
      
      // Set up WebSocket listener for updates
      webSocketClient.connect();
      
      webSocketClient.on('new_rfq', (data) => {
        setActiveRfqs(prev => [data, ...prev]);
      });
      
      webSocketClient.on('rfq_update', (data) => {
        // Update in both active RFQs and my bids
        setActiveRfqs(prev => {
          const index = prev.findIndex(rfq => rfq.id === data.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = data;
            return updated;
          }
          return prev;
        });
        
        setMyBids(prev => {
          const index = prev.findIndex(bid => bid.rfq_id === data.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index].rfq_status = data.status;
            return updated;
          }
          return prev;
        });
      });
      
      webSocketClient.on('bid_status_update', (data) => {
        setMyBids(prev => {
          const index = prev.findIndex(bid => bid.id === data.bid_id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index].status = data.status;
            return updated;
          }
          return prev;
        });
      });
      
      webSocketClient.on('metrics_update', (data) => {
        setMetrics(data);
      });
    }
    
    return () => {
      webSocketClient.off('new_rfq');
      webSocketClient.off('rfq_update');
      webSocketClient.off('bid_status_update');
      webSocketClient.off('metrics_update');
    };
  }, [auth.isAuthenticated, auth.loading, router]);
  
  const getBidStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRfqStatusClass = (status) => {
    switch (status) {
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
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
              Supplier Dashboard
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* My Bids Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  My Bids
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Track your bids and their statuses
                </p>
              </div>
              
              {error && (
                <div className="px-4 py-5 sm:px-6">
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error loading bids
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
                  {myBids.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      You haven't placed any bids yet. Check out the open RFQs below!
                    </li>
                  ) : (
                    myBids.map((bid) => (
                      <li key={bid.id}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-primary-600 truncate">
                                {bid.rfq_title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBidStatusClass(bid.status)}`}>
                                  {formatStatus(bid.status)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Delivery: {bid.delivery_days} days
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  Bid: ₹{bid.price.toLocaleString()}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                RFQ Status: {formatStatus(bid.rfq_status)}
                              </div>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => router.push(`/rfq/${bid.rfq_id}`)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                View RFQ
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
            
            {/* Active RFQs Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Open RFQs
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Browse and bid on available RFQs
                </p>
              </div>
              
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
                  {activeRfqs.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      No open RFQs available at the moment. Check back later!
                    </li>
                  ) : (
                    activeRfqs.map((rfq) => (
                      <li key={rfq.id}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-primary-600 truncate">
                                {rfq.title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRfqStatusClass(rfq.status)}`}>
                                  {formatStatus(rfq.status)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  Budget: ₹{rfq.budget.toLocaleString()}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Delivery: {rfq.delivery_days} days
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                {rfq.bid_count || 0} {rfq.bid_count === 1 ? 'bid' : 'bids'}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                              {rfq.description}
                            </div>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => router.push(`/rfq/${rfq.id}`)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                View & Bid
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
                  Your Metrics
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
                        Completion Rate
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {(metrics.completion_rate * 100).toFixed(1)}%
                      </dd>
                    </div>
                    <div className="overflow-hidden">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Rating
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 flex items-center">
                        {metrics.avg_rating.toFixed(1)}
                        <div className="ml-2 flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${i < Math.round(metrics.avg_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15.585l-6.327 3.327a1 1 0 01-1.45-1.054l1.208-7.04-5.118-4.984a1 1 0 01.555-1.705l7.073-1.027 3.172-6.42a1 1 0 011.778 0l3.172 6.42 7.073 1.027a1 1 0 01.555 1.705l-5.12 4.984 1.209 7.04a1 1 0 01-1.45 1.054L10 15.585z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div className="overflow-hidden">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg. Delivery Time
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {metrics.avg_delivery_days.toFixed(1)} days
                      </dd>
                    </div>
                    <div className="overflow-hidden">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Orders
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {metrics.total_completed}
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
