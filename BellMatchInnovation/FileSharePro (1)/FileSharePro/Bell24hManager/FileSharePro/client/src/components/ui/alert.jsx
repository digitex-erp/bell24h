import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

const variants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 280,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const icons = {
  default: <Info className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
};

const styles = {
  default: {
    container: "border-blue-200 bg-blue-50",
    icon: "text-blue-600",
    title: "text-blue-800",
    description: "text-blue-700"
  },
  error: {
    container: "border-red-200 bg-red-50",
    icon: "text-red-600",
    title: "text-red-800",
    description: "text-red-700"
  },
  warning: {
    container: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
    title: "text-amber-800",
    description: "text-amber-700"
  },
  success: {
    container: "border-green-200 bg-green-50",
    icon: "text-green-600",
    title: "text-green-800",
    description: "text-green-700"
  },
};

export function Alert({
  variant = "default",
  title,
  description,
  action,
  icon,
  dismissible = false,
  onDismiss,
  className = "",
  visible = true,
}) {
  const style = styles[variant] || styles.default;
  const alertIcon = icon || icons[variant] || icons.default;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`rounded-lg border p-4 ${style.container} ${className}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 mr-3 ${style.icon}`}>
              {alertIcon}
            </div>
            <div className="flex-1">
              {title && (
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`text-sm font-medium ${style.title}`}
                >
                  {title}
                </motion.h3>
              )}
              {description && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`mt-1 text-sm ${style.description}`}
                >
                  {description}
                </motion.div>
              )}
              {action && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3"
                >
                  {action}
                </motion.div>
              )}
            </div>
            {dismissible && onDismiss && (
              <button
                type="button"
                className={`inline-flex flex-shrink-0 ml-3 ${style.icon} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md`}
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}