/**
 * Supplier Empty State Component
 * 
 * This component provides specialized empty states for supplier-related scenarios
 * with unique micro-interactions and contextual suggestions.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  UserCheck, 
  TrendingUp, 
  ShieldCheck,
  Star,
  Filter,
  RefreshCw,
  Users,
  MessageSquare,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import AnimatedIllustration from './animated-illustration';
import EmptyState from './empty-state';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.07,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { when: "afterChildren" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    y: -5,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  tap: { 
    y: 0,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)"
  }
};

const suggestedSupplierVariants = {
  hidden: { opacity: 0, scale: 0.9, x: -10 },
  visible: (custom) => ({ 
    opacity: 1, 
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.3 + (custom * 0.1)
    }
  }),
  hover: {
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
      delay: 0.5
    }
  }
};

const shimmerVariants = {
  hidden: { backgroundPosition: '200% 0' },
  visible: { 
    backgroundPosition: '-200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear"
    }
  }
};

/**
 * SupplierEmptyState displays a specialized empty state for supplier-related views
 * with micro-interactions and contextual suggestions.
 * 
 * @param {string} type - Type of empty state ('NO_SUPPLIERS', 'NO_MATCHES', etc.)
 * @param {function} onAction - Function to call when the primary action button is clicked
 * @param {Array} suggestedSuppliers - Array of suggested suppliers to display
 * @param {function} onSupplierSelect - Function to call when a suggested supplier is selected
 * @param {boolean} showFilters - Whether to show industry filter suggestions
 * @param {boolean} isLoading - Whether the component is in a loading state
 */
const SupplierEmptyState = ({
  type = 'NO_SUPPLIERS',
  onAction,
  suggestedSuppliers = [],
  onSupplierSelect,
  showFilters = true,
  isLoading = false,
  className = '',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState('suggested');
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Set animation complete after delay to ensure smooth animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Configuration for different empty state types
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'NO_SUPPLIERS':
        return {
          title: "No Suppliers Found",
          description: "You don't have any suppliers in your network yet.",
          actionText: "Find Suppliers",
          actionIcon: Building,
          illustrationType: "search"
        };
      case 'NO_MATCHES':
        return {
          title: "No Matching Suppliers",
          description: "No suppliers match your current filter criteria.",
          actionText: "Clear Filters",
          actionIcon: Filter,
          illustrationType: "search"
        };
      case 'NO_VERIFIED':
        return {
          title: "No Verified Suppliers",
          description: "You don't have any verified suppliers in your network.",
          actionText: "Browse Verified Suppliers",
          actionIcon: ShieldCheck,
          illustrationType: "noData"
        };
      case 'NO_COMMUNICATIONS':
        return {
          title: "No Communications",
          description: "You haven't exchanged any messages with suppliers yet.",
          actionText: "Find Suppliers to Message",
          actionIcon: MessageSquare,
          illustrationType: "notification"
        };
      case 'EMPTY_HISTORY':
        return {
          title: "No Transaction History",
          description: "You haven't completed any transactions with suppliers.",
          actionText: "Explore Suppliers",
          actionIcon: TrendingUp,
          illustrationType: "noData"
        };
      default:
        return {
          title: "No Suppliers",
          description: "There are no suppliers to display.",
          actionText: "Browse All Suppliers",
          actionIcon: Users,
          illustrationType: "noData"
        };
    }
  };
  
  const emptyConfig = getEmptyStateConfig();
  
  // Industry filter suggestions
  const industryFilters = [
    { label: "Manufacturing", icon: Building },
    { label: "Electronics", icon: Building },
    { label: "Automotive", icon: Building },
    { label: "Textiles", icon: Building },
    { label: "Chemical", icon: Building },
    { label: "Packaging", icon: Building }
  ];
  
  // Rating filter suggestions
  const ratingFilters = [
    { label: "5 Star", icon: Star },
    { label: "4+ Star", icon: Star },
    { label: "3+ Star", icon: Star }
  ];
  
  // Sample placeholder for suggested suppliers when none provided
  const placeholderSuppliers = [
    {
      id: 1,
      name: "Global Manufacturing Solutions",
      industry: "Manufacturing",
      rating: 4.8,
      isVerified: true,
      responseTime: "Within 24 hours"
    },
    {
      id: 2,
      name: "Pioneer Electronics Supply",
      industry: "Electronics",
      rating: 4.5,
      isVerified: true,
      responseTime: "Within 48 hours"
    },
    {
      id: 3,
      name: "Superior Auto Parts",
      industry: "Automotive",
      rating: 4.2,
      isVerified: false,
      responseTime: "Within 24 hours"
    }
  ];
  
  // Use provided suppliers or placeholders if in loading state
  const displaySuppliers = isLoading 
    ? placeholderSuppliers 
    : (suggestedSuppliers.length > 0 ? suggestedSuppliers : placeholderSuppliers);
  
  const renderSupplierCard = (supplier, index) => {
    return (
      <motion.div
        key={supplier.id}
        className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer ${isLoading ? 'pointer-events-none' : ''}`}
        variants={suggestedSupplierVariants}
        custom={index}
        whileHover={isLoading ? {} : "hover"}
        onClick={() => !isLoading && onSupplierSelect && onSupplierSelect(supplier)}
      >
        <div className="flex justify-between items-start mb-2">
          {isLoading ? (
            <motion.div
              className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
              variants={shimmerVariants}
              initial="hidden"
              animate="visible"
            />
          ) : (
            <h4 className="text-sm font-medium text-gray-900">{supplier.name}</h4>
          )}
          
          {!isLoading && supplier.isVerified && (
            <motion.div
              className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"
              variants={badgeVariants}
            >
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verified
            </motion.div>
          )}
        </div>
        
        {isLoading ? (
          <>
            <motion.div
              className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded mb-2"
              variants={shimmerVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.div
              className="h-4 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
              variants={shimmerVariants}
              initial="hidden"
              animate="visible"
            />
          </>
        ) : (
          <>
            <div className="text-xs text-gray-600 mb-1">Industry: {supplier.industry}</div>
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <div className="flex items-center mr-4">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                {supplier.rating}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 text-blue-500 mr-1" />
                {supplier.responseTime}
              </div>
            </div>
            <div className="text-xs text-blue-600 flex items-center mt-2">
              View profile
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          </>
        )}
      </motion.div>
    );
  };
  
  return (
    <motion.div
      className={`w-full ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      <div className="flex flex-col items-center justify-center p-6">
        {/* Animated Illustration */}
        <div className="mb-4">
          <AnimatedIllustration
            type={emptyConfig.illustrationType}
            colors={{
              primary: "#1E40AF",
              secondary: "#93C5FD",
              accent: "#3B82F6",
              background: "#EFF6FF"
            }}
            size={180}
          />
        </div>
        
        {/* Main Empty State Message */}
        <EmptyState
          type="CUSTOM"
          title={emptyConfig.title}
          description={emptyConfig.description}
          className="max-w-lg"
        >
          {/* Action Button */}
          {onAction && (
            <div className="mt-4 flex justify-center">
              <motion.button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium inline-flex items-center hover:bg-blue-700 transition-colors"
                onClick={onAction}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <emptyConfig.actionIcon className="mr-2 h-4 w-4" />
                )}
                {emptyConfig.actionText}
              </motion.button>
            </div>
          )}
        </EmptyState>
      </div>
      
      {/* Suggested Suppliers and Filters Section */}
      <AnimatePresence>
        {animationComplete && (
          <motion.div
            className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <motion.button
                className={`pb-2 mr-4 text-sm font-medium ${activeTab === 'suggested' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('suggested')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserCheck className="h-4 w-4 inline mr-1" />
                Suggested Suppliers
              </motion.button>
              
              {showFilters && (
                <motion.button
                  className={`pb-2 text-sm font-medium ${activeTab === 'filters' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('filters')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="h-4 w-4 inline mr-1" />
                  Browse by Filters
                </motion.button>
              )}
            </div>
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'suggested' && (
                <motion.div
                  key="suggested"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Suppliers you might be interested in:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displaySuppliers.map((supplier, index) => renderSupplierCard(supplier, index))}
                  </div>
                  
                  {!isLoading && (
                    <motion.div
                      className="text-center mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-800 inline-flex items-center">
                        View more suppliers
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'filters' && showFilters && (
                <motion.div
                  key="filters"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Browse by Industry:</h3>
                    <div className="flex flex-wrap gap-2">
                      {industryFilters.map((filter, index) => (
                        <motion.button
                          key={`industry-${index}`}
                          className="bg-white px-3 py-1 rounded-full text-xs border border-gray-200 inline-flex items-center hover:bg-gray-50"
                          variants={cardVariants}
                          custom={index}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <filter.icon className="h-3 w-3 mr-1" />
                          {filter.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Rating:</h3>
                    <div className="flex flex-wrap gap-2">
                      {ratingFilters.map((filter, index) => (
                        <motion.button
                          key={`rating-${index}`}
                          className="bg-white px-3 py-1 rounded-full text-xs border border-gray-200 inline-flex items-center hover:bg-gray-50"
                          variants={cardVariants}
                          custom={index + 3} // Offset animation timing
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <filter.icon className="h-3 w-3 text-yellow-500 mr-1" />
                          {filter.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SupplierEmptyState;