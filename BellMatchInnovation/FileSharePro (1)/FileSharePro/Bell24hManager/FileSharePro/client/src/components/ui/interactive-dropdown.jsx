import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Interactive dropdown with engaging micro-interactions for empty states
 */
export function InteractiveDropdown({
  label,
  placeholder = "Select an option",
  options = [],
  value,
  onChange,
  emptyStateTitle = "No options available",
  emptyStateDescription = "There are no options available for selection.",
  emptyStateIcon,
  emptyStateAction,
  createNewLabel = "Create New",
  onCreateNew,
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery("");
        setIsSearching(false);
      }
    }
  };

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: "auto",
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  const noResultsVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={`relative border rounded-md shadow-sm ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer hover:border-blue-500"
        } ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"}`}
      >
        <div 
          className="flex items-center justify-between px-3 py-2"
          onClick={toggleDropdown}
        >
          <div className="flex-1 truncate">
            {selectedOption ? (
              <span>{selectedOption.label}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2 text-gray-400"
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute mt-1 w-full z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {options.length > 5 && (
                <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-10 py-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search options..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearching(true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {filteredOptions.length > 0 ? (
                <div className="py-1">
                  {filteredOptions.map((option, index) => (
                    <motion.div
                      key={option.value}
                      variants={itemVariants}
                      custom={index}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        option.value === value
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleSelect(option.value)}
                      whileHover={{ backgroundColor: option.value === value ? "#dbeafe" : "#f3f4f6" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.label}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="py-6 px-4" 
                  variants={noResultsVariants}
                >
                  {isSearching ? (
                    <div className="text-center">
                      <motion.div 
                        className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-3"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Search className="h-6 w-6 text-gray-400" />
                      </motion.div>
                      <p className="text-sm text-gray-500 mb-2">No results found for "{searchQuery}"</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <EmptyState
                      title={emptyStateTitle}
                      description={emptyStateDescription}
                      icon={emptyStateIcon}
                      action={onCreateNew ? () => (
                        <div className="flex flex-col space-y-2">
                          {emptyStateAction && (
                            <div>{emptyStateAction}</div>
                          )}
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateNew();
                              setIsOpen(false);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {createNewLabel}
                          </Button>
                        </div>
                      ) : emptyStateAction}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}