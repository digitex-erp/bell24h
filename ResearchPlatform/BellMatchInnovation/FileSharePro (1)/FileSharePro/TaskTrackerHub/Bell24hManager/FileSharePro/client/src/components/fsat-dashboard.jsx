/**
 * FSAT Dashboard Component
 * 
 * This component demonstrates integration with the FSAT API
 * for financial services and trading.
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const FsatDashboard = () => {
  const [services, setServices] = useState({
    loading: true,
    error: null,
    data: null
  });

  const [orders, setOrders] = useState({
    loading: true,
    error: null,
    data: null
  });

  const fetchServices = async () => {
    setServices({
      loading: true,
      error: null,
      data: services.data
    });

    try {
      const response = await fetch('/api/external/fsat/services');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      setServices({
        loading: false,
        error: null,
        data: data
      });
    } catch (error) {
      setServices({
        loading: false,
        error: error.message,
        data: null
      });
    }
  };

  const fetchOrders = async () => {
    setOrders({
      loading: true,
      error: null,
      data: orders.data
    });

    try {
      const response = await fetch('/api/external/fsat/orders');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      setOrders({
        loading: false,
        error: null,
        data: data
      });
    } catch (error) {
      setOrders({
        loading: false,
        error: error.message,
        data: null
      });
    }
  };

  useEffect(() => {
    fetchServices();
    fetchOrders();
  }, []);

  // Mock data for empty states & demonstration
  const mockServices = [
    { id: 1, name: "Invoice Discounting", status: "active", fee: "2.5%" },
    { id: 2, name: "Supply Chain Financing", status: "active", fee: "3.0%" },
    { id: 3, name: "Working Capital Loans", status: "maintenance", fee: "8.5%" },
    { id: 4, name: "Letter of Credit", status: "active", fee: "1.5%" }
  ];
  
  const mockOrders = [
    { id: "ORD-12345", type: "Invoice Discounting", status: "completed", amount: "₹250,000", date: "2023-09-15" },
    { id: "ORD-12346", type: "Supply Chain Financing", status: "processing", amount: "₹500,000", date: "2023-09-18" },
    { id: "ORD-12347", type: "Working Capital Loan", status: "pending", amount: "₹1,500,000", date: "2023-09-20" },
    { id: "ORD-12348", type: "Letter of Credit", status: "rejected", amount: "₹750,000", date: "2023-09-14" }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
      case 'processing':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const renderServices = () => {
    if (services.loading) {
      return (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      );
    }

    if (services.error) {
      return (
        <div className="text-center p-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load services</p>
          <p className="text-sm text-red-500 mt-1">{services.error}</p>
          <button 
            onClick={fetchServices}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </button>
        </div>
      );
    }

    // Using mock data for display since we have a placeholder API
    const displayServices = mockServices;

    return (
      <ul className="divide-y divide-gray-200">
        {displayServices.map(service => (
          <li key={service.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2">
            <div className="flex items-center">
              <div className="mr-3">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{service.name}</h4>
                <p className="text-xs text-gray-500">Fee: {service.fee}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                service.status === 'active' ? 'bg-green-100 text-green-800' : 
                service.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {getStatusIcon(service.status)}
                <span className="ml-1">{service.status}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderOrders = () => {
    if (orders.loading) {
      return (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      );
    }

    if (orders.error) {
      return (
        <div className="text-center p-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load orders</p>
          <p className="text-sm text-red-500 mt-1">{orders.error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </button>
        </div>
      );
    }

    // Using mock data for display since we have a placeholder API
    const displayOrders = mockOrders;

    return (
      <ul className="divide-y divide-gray-200">
        {displayOrders.map(order => (
          <li key={order.id} className="py-3 hover:bg-gray-50 px-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium">{order.id}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                order.status === 'processing' || order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{order.type}</span>
              <span>{order.date}</span>
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium">{order.amount}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4">
        <div className="flex items-center text-white">
          <DollarSign className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">FSAT Financial Services</h3>
        </div>
        <p className="text-green-100 text-sm mt-1">
          Trade financing and financial services
        </p>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" /> 
            Available Services
          </h4>
          {renderServices()}
        </div>
        
        <div>
          <h4 className="text-md font-medium mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" /> 
            Recent Orders
          </h4>
          {renderOrders()}
        </div>
      </div>
    </div>
  );
};

export default FsatDashboard;