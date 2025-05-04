import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SupplierCard from '../../components/SupplierCard';
import { supabase } from '../../lib/supabaseClient';
import { webSocketClient } from '../../lib/websocket';

export default function RFQDetail({ auth }) {
  const router = useRouter();
  const { id } = router.query;
  
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userBid, setUserBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bid form state
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDeliveryDays, setBidDeliveryDays] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState(null);
  
  useEffect(() => {
    // Don't do anything if id is not available yet
    if (!id) return;
    
    const fetchRfqData = async () => {
      try {
        // Get user role
        if (auth.isAuthenticated) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', auth.user.id)
            .single();
            
          if (profileError) throw profileError;
          setUserRole(profileData.role);
        }
        
        // Fetch RFQ details
        const response = await fetch(`/api/rfq/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch RFQ details');
        }
        
        setRfq(data);
        
        // Fetch bids if user is the buyer or an admin
        if (auth.isAuthenticated && (
          auth.user.id === data.buyer_id || 
          (userRole === 'admin')
        )) {
          const bidsResponse = await fetch(`/api/rfq/${id}/bids`);
          const bidsData = await bidsResponse.json();
          
          if (!bidsResponse.ok) {
            throw new Error(bidsData.message || 'Failed to fetch bids');
          }
          
          setBids(bidsData);
        }
        
        // Fetch AI recommended suppliers if user is the buyer
        if (auth.isAuthenticated && auth.user.id === data.buyer_id) {
          const suppliersResponse = await fetch(`/api/rfq/${id}/suppliers`);
          const suppliersData = await suppliersResponse.json();
          
          if (!suppliersResponse.ok) {
            throw new Error(suppliersData.message || 'Failed to fetch suppliers');
          }
          
          setSuppliers(suppliersData);
        }
        
        // Check if user has already bid (if supplier)
        if (auth.isAuthenticated && userRole === 'supplier') {
          const userBidResponse = await fetch(`/api/rfq/${id}/user-bid`);
          const userBidData = await userBidResponse.json();
          
          if (userBidResponse.ok && userBidData) {
            setUserBid(userBidData);
          }
        }
      } catch (error) {
        console.error('Error fetching RFQ data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.isAuthenticated) {
      fetchRfqData();
      
      // Set up WebSocket listener for real-time updates
      webSocketClient.connect();
      
      webSocketClient.on('rfq_update', (data) => {
        if (data.id === id) {
          setRfq(data);
        }
      });
      
      webSocketClient.on('new_bid', (data) => {
        if (data.rfq_id === id) {
          setBids(prev => [data, ...prev]);
        }
      });
      
      webSocketClient.on('bid_status_update', (data) => {
        setBids(prev => {
          const index = prev.findIndex(bid => bid.id === data.bid_id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index].status = data.status;
            return updated;
          }
          return prev;
        });
        
        if (userBid && userBid.id === data.bid_id) {
          setUserBid(prev => ({
            ...prev,
            status: data.status
          }));
        }
      });
    }
    
    return () => {
      webSocketClient.off('rfq_update');
      webSocketClient.off('new_bid');
      webSocketClient.off('bid_status_update');
    };
  }, [id, auth.isAuthenticated, auth.user, userRole]);
  
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setBidLoading(true);
    setBidError(null);
    
    const price = parseFloat(bidAmount);
    const delivery_days = parseInt(bidDeliveryDays);
    
    if (isNaN(price) || price <= 0) {
      setBidError('Please enter a valid bid amount');
      setBidLoading(false);
      return;
    }
    
    if (isNaN(delivery_days) || delivery_days <= 0) {
      setBidError('Please enter a valid delivery time');
      setBidLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/rfq/${id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price,
          delivery_days,
          notes: bidNotes,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit bid');
      }
      
      // Update user bid
      setUserBid(data);
      setShowBidForm(false);
      
      // Reset form
      setBidAmount('');
      setBidDeliveryDays('');
      setBidNotes('');
    } catch (error) {
      console.error('Error submitting bid:', error);
      setBidError(error.message);
    } finally {
      setBidLoading(false);
    }
  };
  
  const handleAcceptBid = async (bidId) => {
    try {
      const response = await fetch(`/api/rfq/${id}/accept-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bid_id: bidId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept bid');
      }
      
      // Update RFQ status
      setRfq(prev => ({
        ...prev,
        status: 'in_progress',
        selected_supplier_id: data.supplier_id,
      }));
      
      // Update bids
      setBids(prev => prev.map(bid => ({
        ...bid,
        status: bid.id === bidId ? 'accepted' : 'rejected'
      })));
    } catch (error) {
      console.error('Error accepting bid:', error);
      setError(error.message);
    }
  };
  
  const handleMarkComplete = async () => {
    try {
      const response = await fetch(`/api/rfq/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark RFQ as complete');
      }
      
      // Update RFQ status
      setRfq(prev => ({
        ...prev,
        status: 'completed',
      }));
    } catch (error) {
      console.error('Error marking RFQ as complete:', error);
      setError(error.message);
    }
  };
  
  const getStatusBadgeClass = (status) => {
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
  
  const getBidStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
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
  
  // Is user the RFQ owner?
  const isOwner = auth.isAuthenticated && rfq && auth.user.id === rfq.buyer_id;
  
  // Is user a supplier?
  const isSupplier = auth.isAuthenticated && userRole === 'supplier';
  
  // Can user bid on this RFQ?
  const canBid = isSupplier && rfq && rfq.status === 'open' && !userBid;
  
  // Can owner accept bids?
  const canAcceptBids = isOwner && rfq && rfq.status === 'open' && bids.length > 0;
  
  // Can owner mark as complete?
  const canMarkComplete = isOwner && rfq && rfq.status === 'in_progress';
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!rfq) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">RFQ Not Found</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>The requested RFQ does not exist or you do not have permission to view it.</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go Back
                </button>
              </div>
            </div>
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
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <a href={isOwner ? "/dashboard/buyer" : "/dashboard/supplier"} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                      Dashboard
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">
                      RFQ Details
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {rfq.title}
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Posted {new Date(rfq.created_at).toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                By {rfq.buyer_name}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(rfq.status)}`}>
                  {formatStatus(rfq.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {canBid && (
              <button
                type="button"
                onClick={() => setShowBidForm(true)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Place Bid
              </button>
            )}
            
            {canMarkComplete && (
              <button
                type="button"
                onClick={handleMarkComplete}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Mark as Complete
              </button>
            )}
          </div>
        </div>
        
        {/* User's bid if supplier */}
        {isSupplier && userBid && (
          <div className="mb-8 bg-blue-50 p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-blue-800">
                  Your Bid
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-blue-600">
                  Bid Status: <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBidStatusBadgeClass(userBid.status)}`}>{formatStatus(userBid.status)}</span>
                </p>
              </div>
              <div className="mt-4 flex md:mt-0">
                <div className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100">
                  ₹{userBid.price.toLocaleString()} • {userBid.delivery_days} days
                </div>
              </div>
            </div>
            {userBid.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-blue-800">Your Notes</h4>
                <p className="mt-1 text-sm text-blue-600">{userBid.notes}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* RFQ Details */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  RFQ Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Request for Quotation #{rfq.id.substring(0, 8)}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {rfq.description}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Category
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {rfq.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Quantity
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {rfq.quantity.toLocaleString()} units
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Budget
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ₹{rfq.budget.toLocaleString()}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Delivery Timeframe
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {rfq.delivery_days} days
                    </dd>
                  </div>
                  
                  {rfq.requirements && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Technical Requirements
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {rfq.requirements}
                      </dd>
                    </div>
                  )}
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Delivery Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {rfq.address}, {rfq.city}, {rfq.state} - {rfq.pincode}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Place Bid Form */}
            {showBidForm && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Place Your Bid
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Submit a competitive quote for this RFQ
                  </p>
                </div>
                
                {bidError && (
                  <div className="mx-4 mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{bidError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <form onSubmit={handleSubmitBid}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="bid-amount" className="block text-sm font-medium text-gray-700">
                          Bid Amount (₹) *
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="bid-amount"
                            id="bid-amount"
                            required
                            min="1"
                            step="0.01"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Your bid amount in ₹"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="delivery-days" className="block text-sm font-medium text-gray-700">
                          Delivery Time (days) *
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="delivery-days"
                            id="delivery-days"
                            required
                            min="1"
                            value={bidDeliveryDays}
                            onChange={(e) => setBidDeliveryDays(e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Number of days"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="bid-notes" className="block text-sm font-medium text-gray-700">
                          Additional Notes
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bid-notes"
                            name="bid-notes"
                            rows={3}
                            value={bidNotes}
                            onChange={(e) => setBidNotes(e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Additional information or terms of your bid"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowBidForm(false)}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={bidLoading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {bidLoading ? 'Submitting...' : 'Submit Bid'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Bids (visible to buyer and admin) */}
            {isOwner && bids.length > 0 && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Bids Received
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {bids.length} {bids.length === 1 ? 'bid' : 'bids'} submitted for this RFQ
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {bids.map((bid) => (
                      <li key={bid.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{bid.supplier_name}</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              ₹{bid.price.toLocaleString()} • {bid.delivery_days} days
                            </p>
                            {bid.notes && (
                              <p className="mt-2 text-sm text-gray-600">{bid.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className={`mr-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBidStatusBadgeClass(bid.status)}`}>
                              {formatStatus(bid.status)}
                            </span>
                            
                            {canAcceptBids && bid.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleAcceptBid(bid.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Accept Bid
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            {/* AI Recommended Suppliers (visible to buyer) */}
            {isOwner && suppliers.length > 0 && rfq.status === 'open' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    AI Recommended Suppliers
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Based on your RFQ requirements
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="space-y-4">
                    {suppliers.map((supplier) => (
                      <SupplierCard 
                        key={supplier.id} 
                        supplier={supplier} 
                        onSelect={(supplierId) => router.push(`/supplier/${supplierId}?rfq=${id}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* RFQ Status Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Status Information
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Current Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(rfq.status)}`}>
                        {formatStatus(rfq.status)}
                      </span>
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Total Bids
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {rfq.bid_count || 0}
                    </dd>
                  </div>
                  
                  {rfq.status === 'in_progress' && rfq.selected_supplier_name && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Selected Supplier
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {rfq.selected_supplier_name}
                      </dd>
                    </div>
                  )}
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Deadline
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
