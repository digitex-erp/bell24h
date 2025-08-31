'use client';
export default function PredictiveAnalyticsPage() {
  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Predictive Analytics</h2>
        <span className='inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-4'>
          Coming soon
        </span>
        <p className='text-gray-600 mb-4'>
          Predict RFQ success rates, supplier reliability, and stock market trends. This dashboard
          will integrate with stock APIs and use advanced analytics to provide actionable business
          insights.
        </p>
        <ul className='list-disc pl-6 text-gray-500'>
          <li>Success rate predictions</li>
          <li>Supplier reliability scoring</li>
          <li>Market trend analysis</li>
        </ul>
      </div>
    </div>
  );
}
