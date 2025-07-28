'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useApi } from '@/hooks/useApi';
import { ApiStateHandler } from '@/components/ui/ApiStateHandler';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

const defaultSteps: Step[] = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up for free and complete your business profile to get started.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    number: '02',
    title: 'Find Products or Suppliers',
    description: 'Browse through thousands of products or find reliable suppliers for your business needs.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  },
  {
    number: '03',
    title: 'Connect & Negotiate',
    description: 'Use our secure messaging system to connect with suppliers and negotiate terms.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    number: '04',
    title: 'Secure Payment & Delivery',
    description: 'Complete transactions with our secure payment system and track your order in real-time.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  }
];

export const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { data: steps = defaultSteps, isLoading, error, refetch } = useApi<Step[]>(
    ['how-it-works'],
    '/api/how-it-works',
    {
      timeout: 5000,
      retries: 2,
      queryOptions: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retryOnMount: true,
      },
    }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const lineVariants = {
    hidden: { width: "0%" },
    visible: { width: "100%", transition: { duration: 1.5, ease: "easeInOut" } }
  };

  const renderStepIcon = (iconPath: string) => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );

  return (
    <section className="py-20 bg-white" id="how-it-works" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">How Bell24H Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with Bell24H in just a few simple steps and transform your global business operations
          </p>
        </motion.div>

        <ApiStateHandler
          isLoading={isLoading}
          error={error}
          retry={refetch}
          loadingComponent={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ))}
            </div>
          }
        >
          {/* Desktop Timeline (lg screens) */}
          <div className="hidden lg:block relative mb-24">
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-blue-500 transform -translate-y-1/2"
              style={{ width: "100%", opacity: 0.3 }}
            ></motion.div>
            
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-blue-600 transform -translate-y-1/2 origin-left"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={lineVariants}
            ></motion.div>

            <motion.div 
              className="grid grid-cols-4 gap-12 relative"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="relative"
                  variants={stepVariants}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-600"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(index + 1) * 25}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>

                  <motion.div 
                    className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center z-10 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white font-bold">{step.number}</span>
                  </motion.div>
                  
                  <div className="bg-white p-6 pt-10 mt-6 rounded-xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
                      {renderStepIcon(step.icon)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    
                    <div className="mt-6 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group">
                      <span>Learn more</span>
                      <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div className="mt-4">
                      <video 
                        className="rounded-lg shadow-lg w-full" 
                        controls
                        poster={`/videos/step${index+1}-preview.jpg`}
                        aria-label={`Video demonstration: ${step.title}`}
                      >
                        <source src={`/videos/step${index+1}.mp4`} type="video/mp4" />
                      </video>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile/Tablet Timeline (md and below screens) */}
          <motion.div 
            className="lg:hidden space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="relative bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-600"
                variants={stepVariants}
              >
                <div className="absolute -left-5 top-8 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  {step.number}
                </div>

                <div className="ml-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                    {renderStepIcon(step.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group">
                    <span>Learn more</span>
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <div className="mt-4">
                    <video 
                      className="rounded-lg shadow-lg w-full" 
                      controls
                      poster={`/videos/step${index+1}-preview.jpg`}
                      aria-label={`Video demonstration: ${step.title}`}
                    >
                      <source src={`/videos/step${index+1}.mp4`} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ApiStateHandler>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Get started with Bell24H"
          >
            <span>Get Started Now</span>
            <svg className="ml-3 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
