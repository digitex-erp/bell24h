import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  BarChart, 
  CalendarClock,
  Search,
  Filter,
  RefreshCw,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyQuoteIllustration } from "@/components/ui/illustrations";

/**
 * Empty state specifically for quotes with engaging micro-interactions
 */
export function QuoteEmptyState({ 
  type = "no-quotes", // 'no-quotes', 'no-results', 'no-matches'
  searchTerm = "",
  onClearSearch,
  onClearFilters,
  onCreateRfq,
  onRefresh
}) {
  // Choose the appropriate content based on the empty state type
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-results':
        return {
          title: "No Search Results",
          description: `We couldn't find any quotes matching "${searchTerm}". Try using different keywords.`,
          icon: <Search className="h-10 w-10 text-gray-400" />,
          primaryAction: onClearSearch,
          primaryActionLabel: "Clear Search",
          animationDelay: 0.2
        };
        
      case 'no-matches':
        return {
          title: "No Matching Quotes",
          description: "There are no quotes that match your current filters. Try adjusting your filter criteria to see more results.",
          icon: <Filter className="h-10 w-10 text-gray-400" />,
          primaryAction: onClearFilters,
          primaryActionLabel: "Clear Filters",
          animationDelay: 0.2
        };
        
      case 'no-quotes':
      default:
        return {
          title: "No Quotes Yet",
          description: "You haven't received any quotes from suppliers yet. Create an RFQ to start connecting with suppliers.",
          icon: <EmptyQuoteIllustration className="h-10 w-10 text-purple-500" />,
          primaryAction: onCreateRfq,
          primaryActionLabel: "Create RFQ",
          secondaryAction: onRefresh,
          secondaryActionLabel: "Refresh",
          animationDelay: 0
        };
    }
  };
  
  const { 
    title, 
    description, 
    icon, 
    primaryAction, 
    primaryActionLabel,
    secondaryAction,
    secondaryActionLabel,
    animationDelay
  } = getEmptyStateContent();

  return (
    <div className="max-w-4xl mx-auto py-6">
      <EmptyState
        title={title}
        description={description}
        icon={icon}
        action={(label) => (
          <div className="flex flex-col sm:flex-row gap-3">
            {primaryAction && (
              <Button onClick={primaryAction}>
                {type === 'no-quotes' && <Plus className="mr-2 h-4 w-4" />}
                {primaryActionLabel}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
}

/**
 * Component for highlighting quote comparison value using micro-interactions
 */
export function EmptyQuoteComparison({ onCreateRfq }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 250,
        damping: 20
      }
    })
  };

  const iconAnimations = {
    hover: (i) => ({
      scale: 1.1,
      rotate: i % 2 === 0 ? 5 : -5,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    })
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-10">
        <motion.h2
          className="text-2xl font-bold mb-4 text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
          }}
        >
          Compare Supplier Quotes
        </motion.h2>
        <motion.p
          className="text-gray-600 max-w-xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.2, duration: 0.5 }
          }}
        >
          Comparing quotes helps you find the best value for your business. Create an RFQ to start receiving quotes from suppliers.
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <motion.div
          custom={0}
          variants={itemVariants}
          whileHover="hover"
          custom={0}
        >
          <div className="bg-white rounded-lg border p-6 h-full">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={0}
            >
              <DollarSign className="h-6 w-6 text-purple-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Compare Pricing</h3>
            <p className="text-gray-600">
              Evaluate price points from multiple suppliers to find the best value for your procurement needs.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          custom={1}
          variants={itemVariants}
          whileHover="hover"
          custom={1}
        >
          <div className="bg-white rounded-lg border p-6 h-full">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={1}
            >
              <Clock className="h-6 w-6 text-blue-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Delivery Times</h3>
            <p className="text-gray-600">
              Compare delivery timeframes to ensure your business needs are met on schedule.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          custom={2}
          variants={itemVariants}
          whileHover="hover"
          custom={2}
        >
          <div className="bg-white rounded-lg border p-6 h-full">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={2}
            >
              <TrendingUp className="h-6 w-6 text-green-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Quality Metrics</h3>
            <p className="text-gray-600">
              Assess supplier quality metrics and performance data to make informed decisions.
            </p>
          </div>
        </motion.div>
      </div>
      
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.5, duration: 0.5 }
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="lg" 
            onClick={onCreateRfq}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New RFQ
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Component for quote details with animation when data is missing
 */
export function QuoteDetailsEmpty({ 
  quoteId, 
  supplierName = "Supplier",
  onRefresh,
  onViewSupplier
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="mb-6 text-center"
        variants={itemVariants}
      >
        <div className="w-16 h-16 bg-purple-100 mx-auto rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quote #{quoteId}
        </h2>
        <p className="text-gray-600">
          From {supplierName}
        </p>
      </motion.div>
      
      <motion.div 
        className="py-4 text-center border-t border-gray-200"
        variants={itemVariants}
      >
        <p className="text-gray-600 mb-6">
          Some details for this quote are missing or unavailable. You can refresh to try again or view the supplier profile for more information.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={onViewSupplier}>
              View Supplier
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}