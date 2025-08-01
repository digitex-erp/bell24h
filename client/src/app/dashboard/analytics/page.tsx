'use client';

import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Analytics Dashboard</h2>
        <p className='text-gray-600'>Track your RFQ performance and business metrics</p>
      </div>
      {/* Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { title: 'Total RFQs', value: '24', change: '+12%', icon: BarChart3, color: 'blue' },
          { title: 'Success Rate', value: '85%', change: '+5%', icon: TrendingUp, color: 'green' },
          { title: 'Active Suppliers', value: '156', change: '+8%', icon: Users, color: 'purple' },
          {
            title: 'Avg. Quote Value',
            value: '₹2.4L',
            change: '+15%',
            icon: DollarSign,
            color: 'amber',
          },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{metric.title}</p>
                  <p className='text-2xl font-bold text-gray-900'>{metric.value}</p>
                  <p className='text-sm text-green-600'>{metric.change} from last month</p>
                </div>
                <div
                  className={`w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Charts Placeholder */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>RFQ Trends</h3>
          <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
            <p className='text-gray-500'>Chart will be implemented here</p>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quote Distribution</h3>
          <div className='h-64 bg-gray-100 rounded-lg flex items-center justify-center'>
            <p className='text-gray-500'>Chart will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
