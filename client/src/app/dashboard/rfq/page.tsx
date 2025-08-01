'use client';
import { useState, useEffect } from 'react';

interface DashboardRFQ {
  id: number;
  title: string;
  status: string;
  quotes: number;
  deadline: string;
}

export default function RFQManagementPage() {
  const [rfqs, setRfqs] = useState<DashboardRFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading RFQs
    setTimeout(() => {
      setRfqs([
        {
          id: 1,
          title: 'Industrial Equipment Request',
          status: 'Active',
          quotes: 5,
          deadline: '2024-01-15',
        },
        {
          id: 2,
          title: 'Software Development Services',
          status: 'Pending',
          quotes: 2,
          deadline: '2024-01-20',
        },
        {
          id: 3,
          title: 'Marketing Materials',
          status: 'Closed',
          quotes: 8,
          deadline: '2024-01-10',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>RFQ Management</h2>
            <p className='text-gray-600'>Create and manage your Request for Quotations</p>
          </div>
          <button className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700'>
            <span>➕</span>
            Create RFQ
          </button>
        </div>
        {/* Search and Filters */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <span>🔍</span>
            <input
              type='text'
              placeholder='Search RFQs...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <button className='px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50'>
            <span>🔽</span>
            Filter
          </button>
        </div>
      </div>
      {/* RFQ List */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Your RFQs</h3>
          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => (
                <div key={i} className='animate-pulse bg-gray-200 h-16 rounded-lg'></div>
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              {rfqs.map(rfq => (
                <div
                  key={rfq.id}
                  className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex items-start space-x-3'>
                      <span>📄</span>
                      <div>
                        <h4 className='font-medium text-gray-900'>{rfq.title}</h4>
                        <p className='text-sm text-gray-500'>Deadline: {rfq.deadline}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          rfq.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : rfq.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rfq.status}
                      </span>
                      <p className='text-sm text-gray-500 mt-1'>{rfq.quotes} quotes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
