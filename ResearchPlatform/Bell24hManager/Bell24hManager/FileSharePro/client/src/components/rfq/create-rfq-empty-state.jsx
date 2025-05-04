import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Check, 
  Tag, 
  Building, 
  Package, 
  Clock, 
  Calendar, 
  Clipboard,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormEmptyState } from "@/components/ui/form-empty-state";

/**
 * Empty state specifically for the RFQ creation form with engaging micro-interactions
 */
export function CreateRfqEmptyState({ onStartCreateRfq }) {
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
      className="max-w-3xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-12">
        <motion.div
          className="inline-block mb-6"
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20
            }
          }}
        >
          <div className="bg-blue-100 p-4 rounded-full">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-bold mb-3 text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.2, duration: 0.5 }
          }}
        >
          Create a Request for Quotation
        </motion.h1>
        
        <motion.p 
          className="text-lg text-gray-600 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.3, duration: 0.5 }
          }}
        >
          Connect with qualified suppliers by creating a detailed RFQ for your business needs.
        </motion.p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <motion.div
          custom={0}
          variants={itemVariants}
          whileHover="hover"
          custom={0}
        >
          <div className="bg-white rounded-lg border p-6 h-full">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={0}
            >
              <Clipboard className="h-6 w-6 text-green-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Clear Requirements</h3>
            <p className="text-gray-600">
              Provide detailed specifications for your requirements to get accurate quotes from suppliers.
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
              className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={1}
            >
              <Tag className="h-6 w-6 text-purple-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Select Category</h3>
            <p className="text-gray-600">
              Choose the right product category to connect with suppliers who specialize in your industry.
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
              className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={2}
            >
              <Building className="h-6 w-6 text-blue-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Target Suppliers</h3>
            <p className="text-gray-600">
              Our AI algorithms will match your RFQ with the most qualified suppliers for your needs.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          custom={3}
          variants={itemVariants}
          whileHover="hover"
          custom={3}
        >
          <div className="bg-white rounded-lg border p-6 h-full">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-lg mb-4"
              variants={iconAnimations}
              custom={3}
            >
              <Calendar className="h-6 w-6 text-amber-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Set Deadline</h3>
            <p className="text-gray-600">
              Specify the response deadline to ensure you receive quotes in a timely manner.
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
          transition: { delay: 0.7, duration: 0.5 }
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="lg" 
            className="px-8"
            onClick={onStartCreateRfq}
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
 * Component for displaying a checklist of completed steps in RFQ creation
 */
export function RfqFormChecklist({ steps = [] }) {
  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const completedSteps = steps.filter(step => step.completed);
  const progress = Math.round((completedSteps.length / steps.length) * 100);
  
  return (
    <motion.div
      className="bg-blue-50 rounded-lg p-4 mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-blue-800">Request for Quotation Progress</h3>
        <span className="text-sm font-medium text-blue-800">{progress}%</span>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
        <motion.div 
          className="bg-blue-600 h-2 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            className="flex items-center"
            variants={itemVariants}
          >
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
              step.completed ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              {step.completed && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className={`text-sm ${
              step.completed ? 'text-blue-800' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
      
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex justify-end"
        >
          <Button size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save and Submit
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Component for showing form progress with success messages
 */
export function RfqFormStepSuccess({ 
  title, 
  description, 
  onContinue, 
  continueLabel = "Continue" 
}) {
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-6 my-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2
          }
        }}
        className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4"
      >
        <Check className="h-8 w-8 text-green-600" />
      </motion.div>
      
      <motion.h3
        className="text-xl font-semibold mb-2 text-gray-900"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.3 }
        }}
      >
        {title}
      </motion.h3>
      
      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.4 }
        }}
      >
        {description}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.5 }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button onClick={onContinue}>
          {continueLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
}