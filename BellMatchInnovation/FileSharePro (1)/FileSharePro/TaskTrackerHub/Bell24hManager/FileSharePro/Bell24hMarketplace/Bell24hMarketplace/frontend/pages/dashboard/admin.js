import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { webSocketClient } from '../../lib/websocket';

export default function AdminDashboard({ auth }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [pendingSuppliers, setPendingSuppliers] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        // Fetch data based on active tab
        if (activeTab === 'suppliers' || activeTab === 'pending') {
          const supplierResponse = await fetch('/api/admin/suppliers');
          const supplierData = await supplierResponse.json();
          
          if (!supplierResponse.ok) {
            throw new Error(supplierData.message || 'Failed to fetch suppliers');
          }
          
          setSuppliers(supplierData.filter(s => s.is_verified));
          setPendingSuppliers(supplierData.filter(s => !s.is_verified));
        }
        
        if (activeTab === 'rfqs') {
          const rfqResponse = await fetch('/api/admin/rfqs');
          const rfqData = await rfqResponse.json();
          
          if (!rfqResponse.ok) {
            throw new Error(rfqData.message || 'Failed to fetch RFQs');
          }
          
          setRfqs(rfqData);
        }
        
        if (activeTab === 'transactions') {
          const txResponse = await fetch('/api/admin/transactions');
          const txData = await txResponse.json();
          
          if (!txResponse.ok) {
            throw new Error(txData.message || 'Failed to fetch transactions');
          }
          
          setTransactions(txData);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.isAuthenticated) {
      fetchData();
      
      // Set up WebSocket listener for updates
      webSocketClient.connect();
      
      webSocketClient.on('supplier_verification', (data) => {
        if (data.is_verified) {
          setPendingSuppliers(prev => prev.filter(s => s.id !== data.id));
          setSuppliers(prev => [...prev, data]);
        } else {
          setPendingSuppliers(prev => [...prev, data]);
          setSuppliers(prev => prev.filter(s => s.id !== data.id));
        }
      });
      
      webSocketClient.on('new_transaction', (data) => {
        setTransactions(prev => [data, ...prev]);
      });
      
      webSocketClient.on('new_rfq', (data) => {
        setRfqs(prev => [data, ...prev]);
      });
    }
    
    return () => {
      webSocketClient.off('supplier_verification');
      webSocketClient.off('new_transaction');
      webSocketClient.off('new_rfq');
    };
  }, [auth.isAuthenticated, auth.loading, router, activeTab]);
  
  const handleVerifySupplier = async (supplierId, approve) => {
    try {
      const response = await fetch('/api/admin/verify-supplier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          approved: approve,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update supplier verification');
      }
      
      // Update the state
      setPendingSuppliers(prev => prev.filter(s => s.id !== supplierId));
      if (approve) {
        setSuppliers(prev => {
          const supplier = pendingSuppliers.find(s => s.id === supplierId);
          return [...prev, { ...supplier, is_verified: true }];
        });
      }
    } catch (error) {
      console.error('Error verifying supplier:', error);
      setError(error.message);
    }
  };
  
  if (auth.loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
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
              Admin Dashboard
            </h2>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`${
                activeTab === 'suppliers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Verified Suppliers
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Verification 
              {pendingSuppliers.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                  {pendingSuppliers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rfqs')}
              className={`${
                activeTab === 'rfqs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              RFQs
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`${
                activeTab === 'transactions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Transactions
            </button>
          </nav>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Content */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Verified Suppliers */}
            {activeTab === 'suppliers' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {suppliers.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      No verified suppliers found.
                    </li>
                  ) : (
                    suppliers.map((supplier) => (
                      <li key={supplier.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-primary-600">
                                {supplier.company_name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {supplier.name} • {supplier.email}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                GSTIN: {supplier.gstin}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                              <button
                                onClick={() => router.push(`/admin/supplier/${supplier.id}`)}
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
              </div>
            )}
            
            {/* Pending Verification */}
            {activeTab === 'pending' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {pendingSuppliers.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      No suppliers pending verification.
                    </li>
                  ) : (
                    pendingSuppliers.map((supplier) => (
                      <li key={supplier.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-primary-600">
                                {supplier.company_name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {supplier.name} • {supplier.email}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                GSTIN: {supplier.gstin}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVerifySupplier(supplier.id, true)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifySupplier(supplier.id, false)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            
            {/* RFQs */}
            {activeTab === 'rfqs' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {rfqs.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      No RFQs found.
                    </li>
                  ) : (
                    rfqs.map((rfq) => (
                      <li key={rfq.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-primary-600">
                                {rfq.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Budget: ₹{rfq.budget.toLocaleString()} • Delivery: {rfq.delivery_days} days
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Created by: {rfq.buyer_name} • Status: {rfq.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                            <div>
                              <button
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
              </div>
            )}
            
            {/* Transactions */}
            {activeTab === 'transactions' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Transactions
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tx.id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                tx.type === 'deposit' ? 'bg-green-100 text-green-800' :
                                tx.type === 'withdrawal' ? 'bg-yellow-100 text-yellow-800' :
                                tx.type === 'payment' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tx.user_name} ({tx.user_role})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{tx.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(tx.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
