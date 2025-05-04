import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRfqGrid, SkeletonCard } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { 
  EmptyInboxIllustration, 
  ErrorIllustration 
} from "@/components/ui/illustrations";
import { FileText, RefreshCw, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const itemVariants = {
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
    y: -4,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      duration: 0.2
    }
  }
};

export default function RfqList() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rfqs');
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setRfqs(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching RFQs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRfqs();
  }, [retryCount]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleCreateRfq = () => {
    alert('Create RFQ feature coming soon!');
  };
  
  if (loading) {
    return <LoadingRfqGrid />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          variant="error"
          title="Error loading RFQs"
          description={`We couldn't load the RFQs. ${error}`}
          icon={<ErrorIllustration className="text-red-600" />}
          action={
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Try Again
            </Button>
          }
        />
      </div>
    );
  }
  
  if (rfqs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Active Requests for Quotes</h2>
        
        <EmptyState
          title="No RFQs Found"
          description="There are currently no active requests for quotes. Be the first to post one and connect with qualified suppliers."
          icon={<EmptyInboxIllustration className="text-blue-600" />}
          action={(label) => (
            <Button 
              onClick={handleCreateRfq}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New RFQ
            </Button>
          )}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Active Requests for Quotes</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {rfqs.map((rfq, i) => (
            <motion.div 
              key={rfq.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden"
              custom={i}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={itemVariants}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-blue-800">{rfq.title}</h3>
                <p className="text-gray-600 mb-4">{rfq.description.length > 120 ? 
                  rfq.description.substring(0, 120) + '...' : rfq.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Quantity:</span> 
                    <span>{rfq.quantity}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Budget:</span> 
                    <span>₹{rfq.budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Deadline:</span> 
                    <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Location:</span> 
                    <span>{rfq.delivery_location}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <motion.span 
                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    whileHover={{ scale: 1.05 }}
                  >
                    {rfq.status.toUpperCase()}
                  </motion.span>
                  <Button
                    className="inline-flex items-center justify-center"
                    onClick={() => alert(`Viewing details for RFQ #${rfq.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}