import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Search, 
  Truck, 
  Factory, 
  Briefcase, 
  Users, 
  Sparkles, 
  Star,
  PlusCircle,
  Filter,
  MapPin,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptySupplierIllustration } from "@/components/ui/illustrations";

/**
 * Empty state component specifically for supplier directory
 */
export function SupplierEmptyState({ 
  onAddSupplier, 
  onSearch,
  searchValue = "",
  isFiltered = false,
  onClearFilters,
  emptyStateType = "no-suppliers" // 'no-suppliers', 'no-results', 'no-matches'
}) {
  // Choose the appropriate content based on the empty state type
  const getEmptyStateContent = () => {
    switch (emptyStateType) {
      case 'no-results':
        return {
          title: "No Search Results",
          description: `We couldn't find any suppliers matching "${searchValue}". Try using different keywords or browse all suppliers.`,
          icon: <Search className="h-10 w-10 text-gray-400" />,
          primaryAction: () => onSearch(""),
          primaryActionLabel: "Clear Search",
          animationDelay: 0.2
        };
        
      case 'no-matches':
        return {
          title: "No Matching Suppliers",
          description: "There are no suppliers that match your current filters. Try adjusting your filter criteria to see more results.",
          icon: <Filter className="h-10 w-10 text-gray-400" />,
          primaryAction: onClearFilters,
          primaryActionLabel: "Clear Filters",
          animationDelay: 0.2
        };
        
      case 'no-suppliers':
      default:
        return {
          title: "No Suppliers Found",
          description: "Your supplier directory is empty. Add suppliers to connect with potential business partners.",
          icon: <EmptySupplierIllustration className="h-10 w-10 text-blue-500" />,
          primaryAction: onAddSupplier,
          primaryActionLabel: "Add Supplier",
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
    animationDelay
  } = getEmptyStateContent();

  return (
    <div className="max-w-4xl mx-auto py-6">
      <EmptyState
        title={title}
        description={description}
        icon={icon}
        action={(label) => (
          <Button onClick={primaryAction}>
            {primaryActionLabel}
          </Button>
        )}
      />
    </div>
  );
}

/**
 * Interactive supplier card with engaging empty state for supplier details
 */
export function SupplierCardSkeleton({ 
  isLoading = false, 
  hasError = false, 
  retryAction,
  onAdd 
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      className="border rounded-lg overflow-hidden bg-white relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {isLoading ? (
        <div className="p-6 space-y-4 relative">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      ) : hasError ? (
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
              }
            }}
            className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"
          >
            <Truck className="h-8 w-8 text-red-500" />
          </motion.div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Supplier</h3>
          <p className="text-gray-500 mb-4">We couldn't load this supplier's information. Please try again.</p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={retryAction}>
              Try Again
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
              }
            }}
            whileHover={{ 
              scale: 1.1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
              }
            }}
            className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 cursor-pointer"
            onClick={onAdd}
          >
            <PlusCircle className="h-8 w-8 text-blue-500" />
          </motion.div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Supplier</h3>
          <p className="text-gray-500 mb-4">Add a new supplier to your network to receive quotes and collaborate.</p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={onAdd}>
              Add Supplier
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Empty state for supplier details page
 */
export function SupplierDetailsEmptyState({ 
  supplierName = "This Supplier", 
  dataType = "information",
  onAction,
  actionLabel = "Request Details"
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
        staggerChildren: 0.1
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

  // Different illustrations for different data types
  const getIcon = () => {
    switch (dataType) {
      case 'products':
        return <Package className="h-10 w-10 text-blue-500" />;
      case 'reviews':
        return <Star className="h-10 w-10 text-amber-500" />;
      case 'performance':
        return <Sparkles className="h-10 w-10 text-purple-500" />;
      case 'team':
        return <Users className="h-10 w-10 text-green-500" />;
      case 'certifications':
        return <Briefcase className="h-10 w-10 text-red-500" />;
      case 'location':
        return <MapPin className="h-10 w-10 text-indigo-500" />;
      case 'history':
        return <Clock className="h-10 w-10 text-gray-500" />;
      case 'information':
      default:
        return <Building2 className="h-10 w-10 text-blue-500" />;
    }
  };

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6"
        variants={itemVariants}
      >
        {getIcon()}
      </motion.div>
      
      <motion.h3 
        className="text-xl font-semibold text-gray-900 mb-2"
        variants={itemVariants}
      >
        No {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Available
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 mb-6 max-w-md mx-auto"
        variants={itemVariants}
      >
        {supplierName} hasn't provided {dataType} details yet. You can request this information to learn more about their capabilities.
      </motion.p>
      
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
}