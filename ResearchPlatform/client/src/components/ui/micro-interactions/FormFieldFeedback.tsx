import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormFieldFeedbackProps {
  isValid?: boolean;
  isInvalid?: boolean;
  message?: string;
  validMessage?: string;
  invalidMessage?: string;
  showIcon?: boolean;
  className?: string;
}

export function FormFieldFeedback({
  isValid = false,
  isInvalid = false,
  message,
  validMessage = "Looks good!",
  invalidMessage = "Please check this field",
  showIcon = true,
  className = "",
}: FormFieldFeedbackProps) {
  // Determine what message to show
  const displayMessage = message || (isValid ? validMessage : (isInvalid ? invalidMessage : ""));
  const shouldShow = Boolean(isValid || isInvalid);
  
  return (
    <AnimatePresence>
      {shouldShow && displayMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -5, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center mt-1 text-xs",
            isValid ? "text-green-500" : "text-destructive",
            className
          )}
        >
          {showIcon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10, 
                delay: 0.1 
              }}
              className="mr-1 flex-shrink-0"
            >
              {isValid ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <AlertCircle size={14} className="text-destructive" />
              )}
            </motion.div>
          )}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            {displayMessage}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}