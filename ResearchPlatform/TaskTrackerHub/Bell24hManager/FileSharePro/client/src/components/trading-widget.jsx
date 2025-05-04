/**
 * Trading Widget Component
 * 
 * This component demonstrates integration with the Kotak Securities API
 * for displaying market data and placing orders.
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';

const TradingWidget = () => {
  const [marketData, setMarketData] = useState({
    loading: true,
    error: null,
    data: null
  });

  const fetchMarketData = async () => {
    setMarketData({
      loading: true,
      error: null,
      data: marketData.data
    });

    try {
      const response = await fetch('/api/external/kotak/market-data');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      setMarketData({
        loading: false,
        error: null,
        data: data
      });
    } catch (error) {
      setMarketData({
        loading: false,
        error: error.message,
        data: null
      });
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Set up a market data refresh interval
    const intervalId = setInterval(fetchMarketData, 30000); // Every 30 seconds
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handlePlaceOrder = async (orderType) => {
    try {
      const response = await fetch('/api/external/kotak/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: orderType,
          symbol: 'TATASTEEL',
          quantity: 10,
          price: orderType === 'buy' ? 1000 : 1010
        })
      });
      
      if (!response.ok) {
        throw new Error(`Order failed: ${response.status}`);
      }
      
      const result = await response.json();
      alert(`Order ${result.success ? 'placed successfully!' : 'failed!'}`);
    } catch (error) {
      alert(`Error placing order: ${error.message}`);
    }
  };

  const getStatusContent = () => {
    if (marketData.loading) {
      return (
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      );
    }

    if (marketData.error) {
      return (
        <div className="text-center p-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load market data</p>
          <p className="text-sm text-red-500 mt-1">{marketData.error}</p>
          <button 
            onClick={fetchMarketData}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </button>
        </div>
      );
    }

    if (!marketData.data) {
      return (
        <div className="text-center p-4">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
          <p className="text-yellow-600">No market data available</p>
          <button 
            onClick={fetchMarketData}
            className="mt-3 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>
      );
    }

    // If we have API data but it's a placeholder (as it would be in our mock)
    if (marketData.data.status === 'success' && marketData.data.note?.includes('placeholder')) {
      return (
        <div className="text-center p-4">
          <TrendingUp className="h-10 w-10 text-blue-500 mx-auto mb-2" />
          <p className="text-blue-600 font-medium">Mock Market Data</p>
          <p className="text-sm text-blue-500 mt-1">
            This is showing placeholder data. Connect real API credentials for live data.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button 
              onClick={() => handlePlaceOrder('buy')}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md text-sm transition-colors"
            >
              Demo Buy
            </button>
            <button 
              onClick={() => handlePlaceOrder('sell')}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
            >
              Demo Sell
            </button>
          </div>
        </div>
      );
    }

    // This would render actual data from a real API (not actually implemented)
    // Just a placeholder for how real data would be displayed
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-lg font-bold">TATASTEEL</h4>
            <p className="text-sm text-gray-600">Tata Steel Ltd.</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">₹1,005.25</p>
            <p className="text-sm text-green-600">+12.75 (1.28%)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Day Range</p>
            <p className="text-sm font-medium">₹980.50 - ₹1,010.25</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">52w Range</p>
            <p className="text-sm font-medium">₹780.25 - ₹1,150.50</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Market Cap</p>
            <p className="text-sm font-medium">₹120,250 Cr</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Volume</p>
            <p className="text-sm font-medium">3.2M</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handlePlaceOrder('buy')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
          >
            Buy
          </button>
          <button 
            onClick={() => handlePlaceOrder('sell')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
          >
            Sell
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
        <div className="flex items-center text-white">
          <Briefcase className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Trading Dashboard</h3>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          Powered by Kotak Securities API
        </p>
      </div>
      
      {getStatusContent()}
    </div>
  );
};

export default TradingWidget;