import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  feedbackDuration?: number;
  showRipple?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function InteractiveButton({
  children,
  isLoading = false,
  loadingText,
  feedbackDuration = 500,
  showRipple = true,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: InteractiveButtonProps) {
  const [rippleEffect, setRippleEffect] = useState<{ x: number, y: number, visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || props.disabled) return;
    
    // Get button dimensions
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate ripple position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Show ripple
    if (showRipple) {
      setRippleEffect({ x, y, visible: true });
      
      // Hide ripple after animation
      setTimeout(() => {
        setRippleEffect(prev => ({ ...prev, visible: false }));
      }, feedbackDuration);
    }
    
    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Ripple effect */}
      {rippleEffect.visible && showRipple && (
        <motion.span
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: feedbackDuration / 1000 }}
          className="absolute bg-white/30 dark:bg-white/20 rounded-full pointer-events-none"
          style={{
            top: rippleEffect.y,
            left: rippleEffect.x,
            width: 20,
            height: 20,
            transformOrigin: "center",
          }}
        />
      )}
      
      {/* Button content */}
      <motion.div
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </motion.div>
    </Button>
  );
}