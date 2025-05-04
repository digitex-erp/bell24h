/**
 * RFQ Analytics Page
 * 
 * This page displays RFQ analytics and provides export functionality.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  TrendingUp, 
  FileText, 
  Users,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';
import RfqAnalyticsExport from '../components/analytics/RfqAnalyticsExport';
import { Chart } from 'chart.js/auto';
import { Bar, Line } from 'react-chartjs-2';

// Sample data for demonstration
const sampleRfqData = {
  id: 12345,
  title: "Industrial Pump Components Procurement",
  status: "Published",
  createdAt: "2023-11-15T10:30:00.000Z",
  buyerName: "Global Manufacturing Inc.",
  category: "Industrial Equipment",
  quoteCount: 5,
  deadline: "2023-12-15T23:59:59.000Z"
};

const sampleQuotesData = [
  { supplierId: 1, supplierName: "PumpTech Solutions", price: 45000, deliveryDays: 21, status: "Submitted" },
  { supplierId: 2, supplierName: "Hydra Components", price: 52500, deliveryDays: 14, status: "Submitted" },
  { supplierId: 3, supplierName: "FluidSystems Inc.", price: 48750, deliveryDays: 18, status: "Submitted" },
  { supplierId: 4, supplierName: "IndustrialParts Co.", price: 51200, deliveryDays: 15, status: "Submitted" },
  { supplierId: 5, supplierName: "MechSupply Ltd.", price: 47800, deliveryDays: 20, status: "Submitted" }
];

const sampleSupplierData = [
  { 
    id: 1, 
    name: "PumpTech Solutions", 
    avgPrice: 45000, 
    avgDeliveryDays: 21, 
    quoteCount: 153, 
    acceptanceRate: 0.87 
  },
  { 
    id: 2, 
    name: "Hydra Components", 
    avgPrice: 52500, 
    avgDeliveryDays: 14, 
    quoteCount: 98, 
    acceptanceRate: 0.92 
  },
  { 
    id: 3, 
    name: "FluidSystems Inc.", 
    avgPrice: 48750, 
    avgDeliveryDays: 18, 
    quoteCount: 127, 
    acceptanceRate: 0.75 
  },
  { 
    id: 4, 
    name: "IndustrialParts Co.", 
    avgPrice: 51200, 
    avgDeliveryDays: 15, 
    quoteCount: 112, 
    acceptanceRate: 0.81 
  },
  { 
    id: 5, 
    name: "MechSupply Ltd.", 
    avgPrice: 47800, 
    avgDeliveryDays: 20, 
    quoteCount: 87, 
    acceptanceRate: 0.79 
  }
];

const sampleMarketData = {
  overview: "The market for industrial pump components has shown moderate price stability over the past 6 months, with a slight downward trend in pricing due to increased supplier competition and improved manufacturing efficiencies.",
  priceTrends: [
    { period: "Jul 2023", avgPrice: 51200, change: 0 },
    { period: "Aug 2023", avgPrice: 50800, change: -0.0078 },
    { period: "Sep 2023", avgPrice: 49500, change: -0.0256 },
    { period: "Oct 2023", avgPrice: 48900, change: -0.0121 },
    { period: "Nov 2023", avgPrice: 48750, change: -0.0031 },
    { period: "Dec 2023", avgPrice: 48200, change: -0.0113 }
  ],
  insights: [
    { 
      title: "Increased Supplier Competition", 
      text: "The number of suppliers offering industrial pump components has increased by 12% in the last quarter, leading to more competitive pricing." 
    },
    { 
      title: "Lead Time Reduction", 
      text: "Average delivery times have decreased from 23 days to 18 days over the past 6 months, indicating improved supply chain efficiency." 
    },
    { 
      title: "Quality Considerations", 
      text: "Despite price competition, high-quality components from tier-1 suppliers still command a 15-20% premium, which buyers should factor into their procurement decisions." 
    }
  ]
};

const RfqAnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rfqData, setRfqData] = useState(null);
  const [quotesData, setQuotesData] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  
  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set data
      setRfqData(sampleRfqData);
      setQuotesData(sampleQuotesData);
      setSupplierData(sampleSupplierData);
      setMarketData(sampleMarketData);
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Price chart data
  const priceChartData = {
    labels: quotesData?.map(q => q.supplierName) || [],
    datasets: [
      {
        label: 'Quote Prices (₹)',
        data: quotesData?.map(q => q.price) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Delivery chart data
  const deliveryChartData = {
    labels: quotesData?.map(q => q.supplierName) || [],
    datasets: [
      {
        label: 'Delivery Days',
        data: quotesData?.map(q => q.deliveryDays) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Supplier performance chart data
  const supplierChartData = {
    labels: supplierData?.map(s => s.name) || [],
    datasets: [
      {
        label: 'Acceptance Rate (%)',
        data: supplierData?.map(s => s.acceptanceRate * 100) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Quote Count',
        data: supplierData?.map(s => s.quoteCount) || [],
        backgroundColor: 'rgba(251, 191, 36, 0.6)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };
  
  // Market trends chart data
  const marketTrendsChartData = {
    labels: marketData?.priceTrends?.map(t => t.period) || [],
    datasets: [
      {
        label: 'Average Price (₹)',
        data: marketData?.priceTrends?.map(t => t.avgPrice) || [],
        fill: true,
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        borderColor: 'rgba(14, 165, 233, 1)',
        tension: 0.4
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };
  
  // Supplier chart options with dual y-axes
  const supplierChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Acceptance Rate (%)'
        },
        min: 0,
        max: 100
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Quote Count'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };
  
  // Format date string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
              </a>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">RFQ Analytics</h1>
          </div>
          
          {/* Export Button */}
          <RfqAnalyticsExport
            rfqData={rfqData}
            quotesData={quotesData}
            supplierData={supplierData}
            marketData={marketData}
            title={`Analytics: ${rfqData?.title || 'RFQ Report'}`}
          />
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* RFQ Summary */}
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">RFQ Summary</h2>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{rfqData.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">ID: #{rfqData.id}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {rfqData.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Buyer:</span>
                      <p className="text-sm text-gray-900">{rfqData.buyerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <p className="text-sm text-gray-900">{rfqData.category}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">{formatDate(rfqData.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Deadline:</span>
                      <p className="text-sm text-gray-900">{formatDate(rfqData.deadline)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Quotes Received:</span>
                      <p className="text-sm font-medium text-blue-600">{rfqData.quoteCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Quote Analysis */}
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Quote Analysis</h2>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price Comparison Chart */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Quote Price Comparison</h3>
                    <div className="h-72">
                      <Bar data={priceChartData} options={chartOptions} />
                    </div>
                  </div>
                  
                  {/* Delivery Time Comparison Chart */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Time Comparison</h3>
                    <div className="h-72">
                      <Bar data={deliveryChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                {/* Quote Statistics */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quote Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase text-blue-700">Average Price</p>
                      <p className="text-xl font-semibold text-blue-900 mt-1">
                        ₹{(quotesData.reduce((sum, q) => sum + q.price, 0) / quotesData.length).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase text-green-700">Avg. Delivery Time</p>
                      <p className="text-xl font-semibold text-green-900 mt-1">
                        {(quotesData.reduce((sum, q) => sum + q.deliveryDays, 0) / quotesData.length).toFixed(0)} days
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase text-yellow-700">Price Range</p>
                      <p className="text-xl font-semibold text-yellow-900 mt-1">
                        ₹{(Math.max(...quotesData.map(q => q.price)) - Math.min(...quotesData.map(q => q.price))).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-xs font-medium uppercase text-purple-700">Total Quotes</p>
                      <p className="text-xl font-semibold text-purple-900 mt-1">
                        {quotesData.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Supplier Comparison */}
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Supplier Comparison</h2>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Supplier Performance</h3>
                  <div className="h-80">
                    <Bar data={supplierChartData} options={supplierChartOptions} />
                  </div>
                </div>
                
                {/* Supplier Data Table */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Supplier Analytics</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supplier
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg. Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg. Delivery
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quote Count
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acceptance Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {supplierData.map((supplier, index) => (
                          <tr key={supplier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {supplier.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{supplier.avgPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {supplier.avgDeliveryDays} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {supplier.quoteCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                supplier.acceptanceRate >= 0.8 ? 'bg-green-100 text-green-800' :
                                supplier.acceptanceRate >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(supplier.acceptanceRate * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Market Trends */}
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Market Trends</h2>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    {marketData.overview}
                  </p>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Price Trends</h3>
                  <div className="h-80">
                    <Line data={marketTrendsChartData} options={chartOptions} />
                  </div>
                </div>
                
                {/* Market Insights */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Market Insights</h3>
                  <div className="space-y-4">
                    {marketData.insights.map((insight, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                        <p className="mt-1 text-sm text-gray-600">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RfqAnalyticsPage;