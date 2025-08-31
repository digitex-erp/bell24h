'use client';

import { AlertCircle, CheckCircle, Truck, Package } from 'lucide-react';

export default function LogisticsPage() {
  const shipments = [
    {
      id: 'SH001',
      rfq: 'Industrial Equipment',
      status: 'In Transit',
      location: 'Mumbai',
      eta: '2 days',
    },
    { id: 'SH002', rfq: 'Raw Materials', status: 'Delivered', location: 'Delhi', eta: 'Completed' },
    {
      id: 'SH003',
      rfq: 'Software Hardware',
      status: 'Processing',
      location: 'Bangalore',
      eta: '5 days',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <span>🚚</span>
              Logistics Tracking
            </h2>
            <p className='text-gray-600'>
              Real-time shipment tracking and logistics management via Shiprocket API
            </p>
          </div>
          <div className='bg-blue-50 rounded-lg p-4'>
            <div className='text-2xl font-bold text-blue-600'>12</div>
            <div className='text-sm text-blue-700'>Active Shipments</div>
          </div>
        </div>
      </div>
      {/* Logistics Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {[
          { title: 'In Transit', value: '8', icon: Truck, color: 'blue' },
          { title: 'Delivered', value: '45', icon: CheckCircle, color: 'green' },
          { title: 'Processing', value: '3', icon: Package, color: 'yellow' },
          { title: 'Delayed', value: '1', icon: AlertCircle, color: 'red' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{stat.title}</p>
                  <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 text-${stat.color}-600`} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Shipment Tracking */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Shipments</h3>
        <div className='space-y-4'>
          {shipments.map(shipment => (
            <div
              key={shipment.id}
              className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'
            >
              <div className='flex justify-between items-start'>
                <div className='flex items-start space-x-3'>
                  <span>📦</span>
                  <div>
                    <h4 className='font-medium text-gray-900'>{shipment.rfq}</h4>
                    <p className='text-sm text-gray-500'>Shipment ID: {shipment.id}</p>
                    <div className='flex items-center mt-1'>
                      <span>📍</span>
                      <span className='text-sm text-gray-600'>{shipment.location}</span>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      shipment.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : shipment.status === 'In Transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {shipment.status}
                  </span>
                  <p className='text-sm text-gray-500 mt-1'>ETA: {shipment.eta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Integration Status */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Shiprocket Integration</h3>
            <p className='text-gray-600'>
              Real-time logistics tracking and automated notifications
            </p>
            <ul className='mt-2 text-sm text-gray-700 space-y-1'>
              <li>• Real-time shipment tracking</li>
              <li>• Automated delivery notifications</li>
              <li>• Multi-carrier support</li>
              <li>• Cost optimization</li>
            </ul>
          </div>
          <div className='text-green-600'>
            <span>✅</span>
            <p className='text-sm font-medium mt-1'>Ready to Integrate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
