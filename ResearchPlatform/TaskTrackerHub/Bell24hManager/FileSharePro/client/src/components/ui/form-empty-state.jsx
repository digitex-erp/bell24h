import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Empty state component specifically designed for forms
 */
export function FormEmptyState({
  title,
  description,
  icon,
  primaryAction,
  primaryActionLabel,
  secondaryAction,
  secondaryActionLabel,
  isCompact = false,
  animationDelay = 0,
  className = "",
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: animationDelay,
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: animationDelay + 0.1
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${
        isCompact ? "p-4" : "p-6"
      } ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`text-center ${isCompact ? "space-y-2" : "space-y-4"}`}>
        {icon && (
          <motion.div
            className="inline-flex mx-auto"
            variants={iconVariants}
            whileHover="hover"
          >
            <div className={`${
              isCompact ? "w-12 h-12" : "w-16 h-16"
            } bg-blue-50 rounded-full flex items-center justify-center`}>
              {icon}
            </div>
          </motion.div>
        )}
        
        <motion.div variants={itemVariants}>
          {title && (
            <h3 className={`${
              isCompact ? "text-base" : "text-lg"
            } font-medium text-gray-900`}>
              {title}
            </h3>
          )}
          
          {description && (
            <p className={`${
              isCompact ? "text-xs" : "text-sm"
            } text-gray-500 mt-1 max-w-sm mx-auto`}>
              {description}
            </p>
          )}
        </motion.div>
        
        {(primaryAction || secondaryAction) && (
          <motion.div 
            className={`flex ${
              isCompact ? "flex-col" : "flex-row"
            } items-center justify-center gap-2 mt-3`}
            variants={itemVariants}
          >
            {primaryAction && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button onClick={primaryAction}>
                  {primaryActionLabel}
                </Button>
              </motion.div>
            )}
            
            {secondaryAction && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  variant="outline" 
                  onClick={secondaryAction}
                >
                  {secondaryActionLabel}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Animated placeholder field for when a form control is empty or loading
 */
export function FormFieldPlaceholder({
  label,
  description,
  icon,
  onClick,
  buttonLabel = "Add",
  loading = false,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <motion.div
        className="border border-dashed border-gray-300 rounded-md p-3 bg-gray-50"
        whileHover={{ 
          borderColor: "#a1a1aa",
          backgroundColor: "#f9fafb",
          transition: { duration: 0.2 }
        }}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <motion.div
              className="flex-shrink-0 text-gray-400"
              animate={loading ? {
                rotate: 360,
                transition: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear"
                }
              } : {}}
            >
              {icon}
            </motion.div>
          )}
          
          <div className="flex-grow min-w-0">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-gray-500"
            >
              {description}
            </motion.p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="sm" 
              variant="outline"
              disabled={loading}
            >
              {buttonLabel}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}