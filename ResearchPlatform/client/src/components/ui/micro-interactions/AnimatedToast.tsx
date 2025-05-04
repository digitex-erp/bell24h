import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface AnimatedToastProps {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  isVisible: boolean;
  onClose: () => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  className?: string;
}

export function AnimatedToast({
  title,
  message,
  type = "info",
  duration = 5000,
  isVisible,
  onClose,
  position = "top-right",
  className = "",
}: AnimatedToastProps) {
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && duration > 0) {
      // Start progress timer
      const totalSteps = 100;
      const stepTime = duration / totalSteps;
      
      const id = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress <= 0) {
            clearInterval(id);
            onClose();
            return 0;
          }
          return prevProgress - 100 / totalSteps;
        });
      }, stepTime);
      
      setIntervalId(id);
      
      return () => {
        if (id) clearInterval(id);
      };
    }
  }, [isVisible, duration, onClose]);

  // Clear timer on manual close
  const handleClose = () => {
    if (intervalId) clearInterval(intervalId);
    onClose();
  };

  // Get position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  }[position];
  
  // Get icon and colors based on type
  const typeConfig = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-500",
      textColor: "text-green-700 dark:text-green-300",
      iconColor: "text-green-500",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5" />,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-500",
      textColor: "text-red-700 dark:text-red-300",
      iconColor: "text-red-500",
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-500",
      textColor: "text-blue-700 dark:text-blue-300",
      iconColor: "text-blue-500",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-500",
      textColor: "text-amber-700 dark:text-amber-300",
      iconColor: "text-amber-500",
    },
  }[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed min-w-[300px] max-w-md z-50 overflow-hidden rounded-lg border shadow-lg",
            positionClasses,
            typeConfig.bgColor,
            typeConfig.borderColor,
            className
          )}
          initial={{ 
            opacity: 0, 
            y: position.includes("top") ? -20 : 20,
            scale: 0.95 
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95, 
            y: position.includes("top") ? -10 : 10,
            transition: { duration: 0.2 } 
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className={cn("flex-shrink-0", typeConfig.iconColor)}>
                {typeConfig.icon}
              </div>
              
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className={cn("text-sm font-medium", typeConfig.textColor)}>
                  {title}
                </p>
                {message && (
                  <p className="mt-1 text-sm opacity-90">
                    {message}
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className={cn(
                    "inline-flex rounded-md bg-transparent p-1",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "hover:bg-gray-200 dark:hover:bg-gray-800"
                  )}
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className={cn("h-1", typeConfig.borderColor, "bg-opacity-40")}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}