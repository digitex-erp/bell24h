'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupplierDashboard() {
  const [currentRole, setCurrentRole] = useState('supplier');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    }
  }, []);

  const handleRoleToggle = () => {
    setCurrentRole(currentRole === 'supplier' ? 'buyer' : 'supplier');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <main className='max-w-7xl mx-auto py-8 px-4'>
      {/* Header with Role Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            {currentRole === 'supplier' ? 'Supplier' : 'Buyer'} Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'User'}! 
            {currentRole === 'supplier' 
              ? ' Manage your products and respond to RFQs.' 
              : ' Find suppliers and create RFQs.'
            }
          </p>
        </div>
        
        {/* Role Toggle Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleRoleToggle}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
          >
            <span className="flex items-center gap-2">
              {currentRole === 'supplier' ? '🛒' : '🏭'}
              Switch to {currentRole === 'supplier' ? 'Buyer' : 'Supplier'} Mode
            </span>
          </button>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          currentRole === 'supplier' 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          <span className="mr-2">
            {currentRole === 'supplier' ? '🏭' : '🛒'}
          </span>
          Currently in {currentRole === 'supplier' ? 'Supplier' : 'Buyer'} mode
        </div>
      </div>

      {currentRole === 'supplier' ? (
        /* SUPPLIER MODE */
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Active RFQs</h3>
              <p className='text-3xl font-bold text-amber-600'>42</p>
              <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Products Listed</h3>
              <p className='text-3xl font-bold text-amber-600'>12</p>
              <p className="text-sm text-gray-500 mt-1">3 pending approval</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Orders</h3>
              <p className='text-3xl font-bold text-amber-600'>8</p>
              <p className="text-sm text-gray-500 mt-1">₹2.4L this month</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h3>
            <div className='flex flex-wrap gap-4'>
              <Link 
                href='/supplier/kyc-upload' 
                className='bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors'
              >
                📄 Upload KYC
              </Link>
              <Link 
                href='/supplier/products/add' 
                className='bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors'
              >
                📦 Add Product
              </Link>
              <Link 
                href='/supplier/rfqs' 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                📋 View RFQs
              </Link>
              <Link 
                href='/supplier/orders' 
                className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
              >
                📊 Manage Orders
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Recent Activity</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-green-500'>✅</span>
                  <div>
                    <p className='font-medium'>New RFQ Received</p>
                    <p className='text-sm text-gray-500'>Electronics components - 2 hours ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>₹45K</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-blue-500'>📦</span>
                  <div>
                    <p className='font-medium'>Product Approved</p>
                    <p className='text-sm text-gray-500'>PCB Manufacturing Kit - 1 day ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>Active</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-orange-500'>💰</span>
                  <div>
                    <p className='font-medium'>Payment Received</p>
                    <p className='text-sm text-gray-500'>Order #12345 - 2 days ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>₹12.5K</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BUYER MODE */
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Active RFQs</h3>
              <p className='text-3xl font-bold text-blue-600'>8</p>
              <p className="text-sm text-gray-500 mt-1">3 pending responses</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Suppliers Found</h3>
              <p className='text-3xl font-bold text-blue-600'>156</p>
              <p className="text-sm text-gray-500 mt-1">12 new this month</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Orders Placed</h3>
              <p className='text-3xl font-bold text-blue-600'>23</p>
              <p className="text-sm text-gray-500 mt-1">₹4.2L total spend</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h3>
            <div className='flex flex-wrap gap-4'>
              <Link 
                href='/buyer/rfq/create' 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                📋 Create RFQ
              </Link>
              <Link 
                href='/buyer/suppliers' 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                🔍 Find Suppliers
              </Link>
              <Link 
                href='/buyer/orders' 
                className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
              >
                📦 My Orders
              </Link>
              <Link 
                href='/buyer/analytics' 
                className='bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors'
              >
                📊 Analytics
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Recent Activity</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-blue-500'>📋</span>
                  <div>
                    <p className='font-medium'>RFQ Created</p>
                    <p className='text-sm text-gray-500'>Electronics components - 1 hour ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>5 quotes</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-green-500'>✅</span>
                  <div>
                    <p className='font-medium'>Order Placed</p>
                    <p className='text-sm text-gray-500'>Industrial machinery - 2 days ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>₹45K</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-purple-500'>🤝</span>
                  <div>
                    <p className='font-medium'>Supplier Connected</p>
                    <p className='text-sm text-gray-500'>TechCorp Solutions - 3 days ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>Verified</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>🤖 AI Recommendations</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'>
                <h4 className='font-semibold text-blue-800 mb-2'>Top Suppliers for Electronics</h4>
                <p className='text-sm text-blue-600 mb-3'>Based on your recent RFQs</p>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>TechSupply Pro</span>
                    <span className='text-green-600'>98% match</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>ElectroCorp</span>
                    <span className='text-green-600'>95% match</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>CircuitMasters</span>
                    <span className='text-green-600'>92% match</span>
                  </div>
                </div>
              </div>
              <div className='p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200'>
                <h4 className='font-semibold text-green-800 mb-2'>Cost Optimization</h4>
                <p className='text-sm text-green-600 mb-3'>Potential savings identified</p>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Bulk ordering</span>
                    <span className='text-green-600'>Save 15%</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Alternative suppliers</span>
                    <span className='text-green-600'>Save 8%</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Payment terms</span>
                    <span className='text-green-600'>Save 5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
