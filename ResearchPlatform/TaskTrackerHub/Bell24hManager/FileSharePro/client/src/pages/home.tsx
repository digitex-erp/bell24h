import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, FileText, ChevronRight, ExternalLink, Search, BellRing } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RfqList from "../RfqList";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  EmptySupplierIllustration, 
  EmptyQuoteIllustration,
  EmptyNotificationIllustration 
} from "@/components/ui/illustrations";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -5,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      duration: 0.2
    }
  }
};

export default function Home() {
  const [_, setLocation] = useLocation();
  const [showSetup, setShowSetup] = useState(false);
  const [showEmptyStates, setShowEmptyStates] = useState({
    suppliers: false,
    quotes: false,
    notifications: false
  });

  const handleCardAction = (feature) => {
    setShowEmptyStates({
      ...showEmptyStates,
      [feature]: true
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowEmptyStates(prev => ({
        ...prev,
        [feature]: false
      }));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-blue-100 p-2 rounded-md">
                <Building2 className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bell24h</h1>
                <p className="text-sm text-gray-500">AI-Powered RFQ Marketplace</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex space-x-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                variant="outline"
                onClick={() => setShowSetup(true)}
              >
                Configuration
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => window.location.href = '/api/health'}
                >
                  API Status
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Supplier Matching</h2>
          <p className="text-gray-600 max-w-3xl">
            Bell24h connects businesses with the best suppliers using advanced AI algorithms. 
            Our platform analyzes your requirements and matches you with qualified vendors to ensure 
            quality, reliability, and value.
          </p>
        </motion.div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <motion.div 
                  className="bg-green-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <FileText className="h-6 w-6 text-green-700" />
                </motion.div>
                <h3 className="text-lg font-bold">Post RFQs</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create detailed RFQs with specific requirements to find the perfect suppliers for your needs.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full" onClick={() => alert('Create RFQ feature coming soon!')}>
                    Create RFQ
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <motion.div 
                  className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Building2 className="h-6 w-6 text-blue-700" />
                </motion.div>
                <h3 className="text-lg font-bold">Find Suppliers</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Discover qualified suppliers with verified ratings and performance metrics.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full" onClick={() => handleCardAction('suppliers')}>
                    Browse Suppliers
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <motion.div 
                  className="bg-purple-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <FileText className="h-6 w-6 text-purple-700" />
                </motion.div>
                <h3 className="text-lg font-bold">Compare Quotes</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Easily compare quotes from multiple suppliers side by side to make informed decisions.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full" onClick={() => handleCardAction('quotes')}>
                    View Quotes
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <motion.div 
                  className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Search className="h-6 w-6 text-indigo-700" />
                </motion.div>
                <h3 className="text-lg font-bold">RFQ Analytics</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Analyze RFQ data, compare suppliers, and export detailed reports to make informed decisions.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full" onClick={() => setLocation("/rfq-analytics")}>
                    View Analytics
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Empty State Popups */}
        <AnimatePresence>
          {showEmptyStates.suppliers && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <EmptyState
                title="No Suppliers Found"
                description="You haven't connected with any suppliers yet. Post an RFQ to discover qualified suppliers that match your needs."
                icon={<EmptySupplierIllustration className="text-blue-600" />}
                action={(label) => (
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowEmptyStates(prev => ({ ...prev, suppliers: false }))}
                    >
                      Close
                    </Button>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Post an RFQ
                    </Button>
                  </div>
                )}
              />
            </motion.div>
          )}

          {showEmptyStates.quotes && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <EmptyState
                title="No Quotes Yet"
                description="You haven't received any quotes from suppliers. Create and publish an RFQ to start receiving quotes."
                icon={<EmptyQuoteIllustration className="text-purple-600" />}
                action={(label) => (
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowEmptyStates(prev => ({ ...prev, quotes: false }))}
                    >
                      Close
                    </Button>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Create RFQ
                    </Button>
                  </div>
                )}
              />
            </motion.div>
          )}

          {showEmptyStates.notifications && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <EmptyState
                title="No Notifications"
                description="You're all caught up! There are no new notifications at this time."
                icon={<EmptyNotificationIllustration className="text-amber-600" />}
                action={(label) => (
                  <Button 
                    variant="outline"
                    onClick={() => setShowEmptyStates(prev => ({ ...prev, notifications: false }))}
                  >
                    Close
                  </Button>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* RFQ List Section */}
        <RfqList />
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-bold mb-4">Bell24h Configuration</h2>
              <p className="mb-4 text-gray-600">
                Configure your Bell24h marketplace instance or run the setup wizard to get started.
              </p>
              <div className="flex flex-col gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => setLocation("/setup")}>
                    Launch Setup Wizard
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => setShowSetup(false)}>
                    Close
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Button */}
      <motion.div 
        className="fixed bottom-6 right-6"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", damping: 20, stiffness: 300 }}
      >
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => handleCardAction('notifications')}
          >
            <BellRing className="h-6 w-6" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
