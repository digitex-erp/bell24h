
import React from 'react';
import { CheckIcon, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiMatching() {
  const features = [
    {
      name: "AI-Powered Supplier Matching",
      description: "Our intelligent algorithm matches buyers with verified suppliers based on multiple criteria including price, delivery time, location and past performance."
    },
    {
      name: "Real-time Market Analysis",
      description: "Get instant market insights and price trends to make informed decisions using our integrated Kotak Securities market data."
    },
    {
      name: "Automated Compliance Checks",
      description: "Automatic verification of GST registration, business licenses and other compliance requirements for all suppliers."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Intelligent Business Matching
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our advanced AI uses machine learning to match you with the perfect business partners while ensuring compliance and reliability.
            </p>
            <div className="space-y-6">
              {features.map((feature) => (
                <motion.div 
                  key={feature.name}
                  className="flex items-start"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-base text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-bl-3xl opacity-10" />
              <BrainCircuit className="h-12 w-12 text-green-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                How Our AI Works
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI continuously learns from successful matches and transaction data to improve matching accuracy and reduce risks for both buyers and suppliers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">98%</p>
                  <p className="text-sm text-gray-600">Match Accuracy</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">24/7</p>
                  <p className="text-sm text-gray-600">Real-time Matching</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
