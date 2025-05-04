/**
 * RFQ Empty State Component
 * 
 * This component provides specialized empty states for RFQ-related scenarios
 * with engaging micro-interactions and tailored content.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  RefreshCw, 
  Filter, 
  Search,
  ArrowRight,
  FileEdit,
  Loader2
} from 'lucide-react';
import AnimatedIllustration from './animated-illustration';
import EmptyState from './empty-state';

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { when: "afterChildren" }
  }
};

// Animation variants for buttons
const buttonVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
};

// Types of RFQ empty states
const RFQ_EMPTY_TYPES = {
  NO_RFQS: {
    title: "No RFQs available",
    description: "There are currently no Request for Quotes in the system.",
    actionText: "Create New RFQ",
    actionIcon: Plus,
    illustrationType: "rfq"
  },
  NO_MATCHES: {
    title: "No Matching RFQs",
    description: "We couldn't find any RFQs matching your search criteria.",
    actionText: "Clear Filters",
    actionIcon: Filter,
    illustrationType: "search"
  },
  NO_QUOTES: {
    title: "No Quotes Received",
    description: "Your RFQ hasn't received any quotes from suppliers yet.",
    actionText: "Refresh",
    actionIcon: RefreshCw,
    illustrationType: "noData"
  },
  ERROR_LOADING: {
    title: "Error Loading RFQs",
    description: "We encountered an error while loading the RFQs. Please try again.",
    actionText: "Try Again",
    actionIcon: RefreshCw,
    illustrationType: "error"
  },
  EMPTY_DRAFTS: {
    title: "No Draft RFQs",
    description: "You don't have any RFQs saved as drafts.",
    actionText: "Create Draft",
    actionIcon: FileEdit,
    illustrationType: "emptyFolder"
  },
  EXPIRED: {
    title: "No Expired RFQs",
    description: "You don't have any expired RFQs to display.",
    actionText: "View Active RFQs",
    actionIcon: ArrowRight,
    illustrationType: "notification"
  }
};

/**
 * RfqEmptyState component provides specialized empty states for RFQ-related scenarios
 * with engaging micro-interactions and tailored content.
 * 
 * @param {string} type - Type of empty state (NO_RFQS, NO_MATCHES, etc.)
 * @param {function} onAction - Function to call when the action button is clicked
 * @param {object} illustrationColors - Custom colors for the illustration
 * @param {Array} quickFilters - Array of quick filter options to display
 * @param {boolean} showQuickTips - Whether to show quick tips
 */
const RfqEmptyState = ({
  type = 'NO_RFQS',
  onAction,
  illustrationColors,
  quickFilters = [],
  showQuickTips = false,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const emptyConfig = RFQ_EMPTY_TYPES[type] || RFQ_EMPTY_TYPES.NO_RFQS;
  const ActionIcon = emptyConfig.actionIcon;
  
  // Handle the action button click with loading state
  const handleAction = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // If onAction returns a promise, wait for it
      if (onAction && typeof onAction === 'function') {
        await onAction();
      }
    } finally {
      // Reset loading state after a slight delay for UX
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };
  
  // Quick tips based on empty state type
  const getTips = () => {
    switch (type) {
      case 'NO_RFQS':
        return [
          "Start by creating your first RFQ",
          "Include detailed specifications for better quotes",
          "Set a reasonable deadline for responses"
        ];
      case 'NO_MATCHES':
        return [
          "Try broadening your search terms",
          "Check for spelling mistakes",
          "Remove some filters to see more results"
        ];
      case 'NO_QUOTES':
        return [
          "Give suppliers more time to respond",
          "Ensure your requirements are clear",
          "Consider adjusting your terms or budget"
        ];
      default:
        return [
          "Make sure your RFQ has clear specifications",
          "Include all relevant details and requirements",
          "Set reasonable timeframes for better responses"
        ];
    }
  };
  
  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      {/* Animated Illustration */}
      <div className="mb-4">
        <AnimatedIllustration 
          type={emptyConfig.illustrationType}
          colors={illustrationColors}
          size={180}
        />
      </div>
      
      <EmptyState
        type="CUSTOM"
        title={emptyConfig.title}
        description={emptyConfig.description}
        className="max-w-md"
      >
        {/* Action Button */}
        {emptyConfig.actionText && onAction && (
          <div className="mt-6 flex justify-center">
            <motion.button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium inline-flex items-center hover:bg-blue-700 transition-colors"
              onClick={handleAction}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ActionIcon className="mr-2 h-4 w-4" />
                  {emptyConfig.actionText}
                </>
              )}
            </motion.button>
          </div>
        )}
        
        {/* Quick Filters */}
        {quickFilters && quickFilters.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Filters:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickFilters.map((filter, index) => (
                <motion.button
                  key={index}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs inline-flex items-center transition-colors"
                  onClick={() => filter.onClick && filter.onClick()}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {filter.icon && <filter.icon className="mr-1 h-3 w-3" />}
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Tips */}
        {showQuickTips && (
          <AnimatePresence>
            <motion.div 
              className="mt-8 bg-blue-50 p-4 rounded-lg text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Tips:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                {getTips().map((tip, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <span className="mr-2 text-blue-500">•</span>
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        )}
      </EmptyState>
    </motion.div>
  );
};

export default RfqEmptyState;