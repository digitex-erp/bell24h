import { useState } from 'react';
import ShapExplanation from './ShapExplanation';

export default function SupplierCard({ supplier, onSelect }) {
  const [showDetails, setShowDetails] = useState(false);

  // Format match score as percentage
  const matchScorePercentage = Math.round(supplier.match_score * 100);
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {supplier.company_name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {supplier.city}, {supplier.state}
            </p>
          </div>
          <div className="flex items-center">
            {supplier.is_gst_verified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                GST Verified
              </span>
            )}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{matchScorePercentage}%</div>
              <p className="text-xs text-gray-500">Match Score</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-4 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Avg. Delivery Time</dt>
            <dd className="mt-1 text-sm text-gray-900">{supplier.avg_delivery_days} days</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Completion Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">{Math.round(supplier.completion_rate * 100)}%</dd>
          </div>
          
          {showDetails && (
            <>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rating</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  {supplier.rating.toFixed(1)}
                  <div className="ml-1 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Price Competitiveness</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.price_competitiveness === 'high' ? 'High' : supplier.price_competitiveness === 'medium' ? 'Medium' : 'Low'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Specializations</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {supplier.specializations.map((spec, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <ShapExplanation shapValues={supplier.shap_values} />
              </div>
            </>
          )}
        </dl>
        
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            {showDetails ? 'Show Less' : 'Show More'}
          </button>
          
          <button
            type="button"
            onClick={() => onSelect(supplier.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Select Supplier
          </button>
        </div>
      </div>
    </div>
  );
}
