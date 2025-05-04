import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="relative pt-1">
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold inline-block text-primary-600"
        >
          Project Setup Progress
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold inline-block text-primary-600"
        >
          {progress}%
        </motion.div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 mt-1">
        <motion.div
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
          style={{ width: "0%" }}
          animate={{ 
            width: `${progress}%`,
            transition: { 
              duration: 0.8,
              ease: "easeOut" 
            }
          }}
        >
          {/* Progress animation */}
          {progress > 0 && progress < 100 && (
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-4 bg-white bg-opacity-30"
              animate={{
                x: ["-100%", "400%"],
                transition: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear"
                }
              }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Celebration animation when completed */}
      {progress === 100 && (
        <motion.div 
          className="absolute -top-3 right-0"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [0, 15, -15, 0],
            transition: { 
              duration: 1,
              type: "spring",
              stiffness: 260,
              damping: 20 
            }
          }}
        >
          <span className="text-lg">🎉</span>
        </motion.div>
      )}
    </div>
  );
}