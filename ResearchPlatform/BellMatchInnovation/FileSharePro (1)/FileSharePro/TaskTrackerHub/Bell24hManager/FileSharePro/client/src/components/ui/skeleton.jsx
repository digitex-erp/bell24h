import React from "react";
import { motion } from "framer-motion";

/**
 * Skeleton component for loading states
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div 
      className={`animate-pulse rounded-md bg-gray-200 ${className}`} 
      {...props} 
    />
  );
}

/**
 * Skeleton card for RFQ items in loading state
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <Skeleton className="h-7 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/6 mb-6" />
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="flex items-center">
            <Skeleton className="h-4 w-20 mr-2" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-18 mr-2" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-22 mr-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-20 mr-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards for RFQ list loading state
 */
export function LoadingRfqGrid() {
  const shimmerVariants = {
    initial: {
      x: "-100%"
    },
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
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Skeleton className="h-8 w-80 mb-2" />
        <Skeleton className="h-4 w-96" />
      </motion.div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <SkeletonCard />
          </motion.div>
        ))}
        
        {/* Shimmer effect overlay */}
        <motion.div
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 z-10"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
    </div>
  );
}