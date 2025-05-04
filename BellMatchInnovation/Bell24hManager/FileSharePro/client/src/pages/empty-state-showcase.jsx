/**
 * Empty State Showcase Page
 * 
 * This page demonstrates different empty state components with 
 * micro-interactions to provide a better user experience when
 * no data is available.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  Users,
  FileText,
  Bell,
  Search,
  RefreshCw,
  Plus,
  Settings,
  ChevronRight
} from 'lucide-react';

// Import our empty state components
import EmptyState from '../components/ui/empty-state';
import AnimatedIllustration from '../components/ui/animated-illustration';
import RfqEmptyState from '../components/ui/rfq-empty-state';
import SupplierEmptyState from '../components/ui/supplier-empty-state';

const EmptyStateShowcase = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock action handler with loading state
  const handleAction = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };
  
  // Mock supplier selection
  const handleSupplierSelect = (supplier) => {
    console.log('Selected supplier:', supplier);
  };
  
  // Different color themes
  const colorThemes = {
    blue: {
      primary: "#3B82F6",
      secondary: "#93C5FD",
      accent: "#2563EB",
      background: "#EFF6FF"
    },
    purple: {
      primary: "#8B5CF6",
      secondary: "#DDD6FE",
      accent: "#6D28D9",
      background: "#F5F3FF"
    },
    green: {
      primary: "#10B981",
      secondary: "#A7F3D0",
      accent: "#059669",
      background: "#ECFDF5"
    },
    amber: {
      primary: "#F59E0B",
      secondary: "#FDE68A",
      accent: "#D97706",
      background: "#FFFBEB"
    }
  };
  
  // Quick filter examples
  const quickFilters = [
    { label: "Manufacturing", icon: Package, onClick: () => console.log('Filter: Manufacturing') },
    { label: "Electronics", icon: Package, onClick: () => console.log('Filter: Electronics') },
    { label: "Last 30 days", icon: FileText, onClick: () => console.log('Filter: Last 30 days') }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <header className="max-w-7xl mx-auto text-center mb-12">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Empty State Micro-Interactions
        </motion.h1>
        <motion.p 
          className="text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Engaging and interactive empty states provide a better user experience 
          when no data is available or during the onboarding process.
        </motion.p>
      </header>
      
      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Empty States
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'illustrations' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('illustrations')}
            >
              Animated Illustrations
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rfq' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('rfq')}
            >
              RFQ Empty States
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'supplier' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('supplier')}
            >
              Supplier Empty States
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Basic Empty States */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <EmptyState 
                  type="DATA" 
                  actionText="Refresh Data" 
                  onAction={handleAction}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <EmptyState 
                  type="SEARCH" 
                  actionText="Clear Search" 
                  onAction={handleAction}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <EmptyState 
                  type="NOTIFICATIONS" 
                  actionText="Check Settings" 
                  onAction={handleAction}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <EmptyState 
                  type="INBOX" 
                  actionText="Send a Message" 
                  onAction={handleAction}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <EmptyState 
                  type="DOCUMENTS" 
                  actionText="Upload Document" 
                  onAction={handleAction}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <EmptyState 
                  type="ERROR" 
                  actionText="Try Again" 
                  onAction={handleAction}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Animated Illustrations */}
        {activeTab === 'illustrations' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Animated SVG Illustrations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 flex flex-col items-center">
                <AnimatedIllustration type="search" colors={colorThemes.blue} size={150} />
                <span className="mt-4 text-sm font-medium text-gray-700">Search</span>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 flex flex-col items-center">
                <AnimatedIllustration type="noData" colors={colorThemes.purple} size={150} />
                <span className="mt-4 text-sm font-medium text-gray-700">No Data</span>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 flex flex-col items-center">
                <AnimatedIllustration type="emptyFolder" colors={colorThemes.amber} size={150} />
                <span className="mt-4 text-sm font-medium text-gray-700">Empty Folder</span>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 flex flex-col items-center">
                <AnimatedIllustration type="error" colors={colorThemes.green} size={150} />
                <span className="mt-4 text-sm font-medium text-gray-700">Error</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 flex flex-col items-center">
                <AnimatedIllustration type="notification" size={200} />
                <span className="mt-4 text-sm font-medium text-gray-700">Notification</span>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 flex flex-col items-center">
                <AnimatedIllustration type="rfq" size={200} />
                <span className="mt-4 text-sm font-medium text-gray-700">RFQ</span>
              </div>
            </div>
          </div>
        )}
        
        {/* RFQ Empty States */}
        {activeTab === 'rfq' && (
          <div className="grid grid-cols-1 gap-12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <RfqEmptyState 
                  type="NO_RFQS" 
                  onAction={handleAction}
                  showQuickTips={true}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <RfqEmptyState 
                  type="NO_MATCHES" 
                  onAction={handleAction}
                  quickFilters={quickFilters}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <RfqEmptyState 
                  type="NO_QUOTES" 
                  onAction={handleAction}
                  showQuickTips={true}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Supplier Empty States */}
        {activeTab === 'supplier' && (
          <div className="space-y-12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <SupplierEmptyState 
                  type="NO_SUPPLIERS" 
                  onAction={handleAction}
                  onSupplierSelect={handleSupplierSelect}
                  isLoading={isLoading}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <SupplierEmptyState 
                  type="NO_VERIFIED" 
                  onAction={handleAction}
                  onSupplierSelect={handleSupplierSelect}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Component Documentation */}
      <div className="max-w-7xl mx-auto mt-16 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Component Documentation</h2>
        </div>
        <div className="px-6 py-5">
          <div className="prose max-w-none">
            <h3>Usage Examples</h3>
            
            <h4>Basic Empty State</h4>
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
              {`<EmptyState 
  type="DATA" 
  actionText="Refresh Data" 
  onAction={() => handleRefresh()}
/>`}
            </pre>
            
            <h4>Animated Illustration</h4>
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
              {`<AnimatedIllustration 
  type="search"
  colors={{
    primary: "#3B82F6",
    secondary: "#93C5FD",
    accent: "#2563EB",
    background: "#EFF6FF"
  }}
  size={180}
/>`}
            </pre>
            
            <h4>RFQ Empty State</h4>
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
              {`<RfqEmptyState 
  type="NO_RFQS" 
  onAction={() => createNewRfq()}
  showQuickTips={true}
/>`}
            </pre>
            
            <h4>Supplier Empty State</h4>
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
              {`<SupplierEmptyState 
  type="NO_SUPPLIERS" 
  onAction={() => findSuppliers()}
  onSupplierSelect={(supplier) => viewSupplierProfile(supplier)}
  isLoading={isLoading}
/>`}
            </pre>
            
            <h3>Benefits of Micro-Interactions</h3>
            <ul>
              <li>Provides visual feedback to users</li>
              <li>Makes empty states more engaging</li>
              <li>Guides users on what to do next</li>
              <li>Improves overall user experience</li>
              <li>Reduces friction during onboarding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateShowcase;