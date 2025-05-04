/**
 * Navigation Component
 * 
 * This component provides a navigation bar with micro-interactions
 * for a better user experience.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Settings,
  FileText,
  Package,
  Users,
  BarChart,
  Menu,
  X,
  ChevronRight,
  Bell
} from 'lucide-react';

// Animation variants
const navVariants = {
  hidden: { 
    opacity: 0, 
    x: -20
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

const linkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  hover: {
    scale: 1.05,
    x: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
};

// Navigation links
const navigationLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Setup', href: '/setup', icon: Settings },
  { name: 'API Dashboard', href: '/api-dashboard', icon: BarChart },
  { name: 'Empty States', href: '/empty-states', icon: FileText },
  { name: 'RFQs', href: '/rfqs', icon: Package },
  { name: 'RFQ Analytics', href: '/rfq-analytics', icon: FileText },
  { name: 'Suppliers', href: '/suppliers', icon: Users }
];

const Navigation = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Close menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // Get active link
  const isLinkActive = (href) => {
    return location === href;
  };
  
  if (!mounted) return null;
  
  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <motion.button
          className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:text-blue-600 focus:outline-none"
          onClick={toggleMenu}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </motion.button>
      </div>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          >
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl p-4"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-lg font-bold text-gray-900">Bell24h</h2>
                <motion.button
                  onClick={closeMenu}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>
              
              <nav>
                <ul className="space-y-2">
                  {navigationLinks.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href}>
                        <motion.a
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                            isLinkActive(link.href)
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                          onClick={closeMenu}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <link.icon className="h-5 w-5 mr-3" />
                          {link.name}
                          {isLinkActive(link.href) && (
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          )}
                        </motion.a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop Navigation */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg pt-8"
        variants={navVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="px-6 mb-8">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl font-bold text-blue-700">Bell24h</h1>
          </motion.div>
          <motion.p
            className="text-sm text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Marketplace Platform
          </motion.p>
        </div>
        
        <nav className="px-3">
          <ul className="space-y-1">
            {navigationLinks.map((link, index) => (
              <motion.li key={link.name} variants={linkVariants}>
                <Link href={link.href}>
                  <motion.a
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isLinkActive(link.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.name}
                    {isLinkActive(link.href) && (
                      <motion.div
                        className="ml-auto"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.a>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        {/* Notification Badge */}
        <motion.div
          className="absolute top-3 right-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 15,
            delay: 1 
          }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="h-5 w-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Main Content Wrapper (provide padding for desktop navigation) */}
      <div className="md:pl-64">
        {/* This is where your page content will render */}
      </div>
    </>
  );
};

export default Navigation;