import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 150
    }
  }
};

const iconVariants = {
  hidden: { rotate: -10, scale: 0.8, opacity: 0 },
  visible: {
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 100
    }
  },
  hover: {
    rotate: [0, -5, 5, -5, 0],
    transition: { 
      duration: 0.5,
      repeat: Infinity,
      repeatType: "mirror" 
    }
  }
};

export default function NotFound() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md w-full"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8 text-center"
        >
          <motion.div
            className="inline-block"
            variants={iconVariants}
            whileHover="hover"
          >
            <div className="bg-red-100 rounded-full p-5 inline-block mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </motion.div>
          <motion.h1 
            variants={itemVariants} 
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            404
          </motion.h1>
          <motion.p 
            variants={itemVariants} 
            className="text-xl font-medium text-gray-800 mb-1"
          >
            Page Not Found
          </motion.p>
          <motion.p 
            variants={itemVariants} 
            className="text-gray-600"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="space-y-3"
        >
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              className="w-full"
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Lost? You might want to check the documentation or contact support.</p>
        </motion.div>

        {/* Easter egg animation */}
        <motion.div
          className="fixed bottom-8 right-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 2, duration: 0.5 } 
          }}
        >
          <motion.div
            whileHover={{ 
              scale: 1.2,
              rotate: 360,
              transition: { duration: 0.5 }
            }}
          >
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 bg-white shadow-md"
              onClick={() => {
                alert("Looking for something specific? Try using the search or checking the menu.");
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
