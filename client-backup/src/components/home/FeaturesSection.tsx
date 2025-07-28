'use client';

import { motion } from 'framer-motion';
import { useApi } from '@/hooks/useApi';
import { ApiStateHandler } from '@/components/ui/ApiStateHandler';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Carousel } from '@/components/ui/carousel';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: '🌐',
    title: 'Global Marketplace',
    description: 'Connect with buyers and sellers from around the world in over 50+ categories.',
    color: 'from-blue-600 to-blue-400'
  },
  {
    icon: '🔒',
    title: 'Secure Transactions',
    description: 'Our escrow service ensures safe and secure transactions for all parties involved.',
    color: 'from-purple-600 to-purple-400'
  },
  {
    icon: '🛡️',
    title: 'Trust & Verification',
    description: 'Verified suppliers and buyers with secure payment protection.',
    color: 'from-green-600 to-green-400'
  },
  {
    icon: '⚡',
    title: 'Fast & Efficient',
    description: 'Quick search, instant quotes, and efficient order processing.',
    color: 'from-amber-600 to-amber-400'
  },
  {
    icon: '💬',
    title: '24/7 Support',
    description: 'Dedicated customer support available round the clock.',
    color: 'from-pink-600 to-pink-400'
  },
  {
    icon: '📈',
    title: 'Business Growth',
    description: 'Tools and insights to help your business grow and succeed.',
    color: 'from-cyan-600 to-cyan-400'
  }
];

export const FeaturesSection = () => {
  const { data: features = defaultFeatures, isLoading, error, refetch } = useApi<Feature[]>(
    ['features'],
    '/api/features',
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
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <section className="py-20 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            Why Choose Bell24H?
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Powerful Features for Global Business</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide the tools and services to help your business grow in the international B2B marketplace.
          </p>
        </motion.div>
        
        <ApiStateHandler
          isLoading={isLoading}
          error={error}
          retry={refetch}
          loadingComponent={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-8 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ))}
            </div>
          }
        >
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 flex flex-col items-center text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 text-white shadow-lg`} style={{ fontSize: '2rem' }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group"
                  aria-label={`Learn more about ${feature.title}`}>
                  <span>Learn more</span>
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ApiStateHandler>

        <div className="lg:hidden">
          <Carousel>
            {features.map((feature, index) => (
              <div key={index} className="px-2">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-8 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 text-white shadow-lg`} style={{ fontSize: '2rem' }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <div className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group"
                    aria-label={`Learn more about ${feature.title}`}>
                    <span>Learn more</span>
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Explore All Features</span>
            <svg className="ml-3 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </motion.div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">What Our Users Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Bell24H has cut our procurement time by 50%. The real-time bidding feature is revolutionary.',
                author: 'John Doe',
                role: 'Procurement Manager'
              },
              {
                quote: 'I\'ve doubled my business since joining Bell24H. The platform makes it easy to find new buyers.',
                author: 'Sarah M.',
                role: 'Supplier'
              },
              {
                quote: 'The analytics dashboard has transformed how we track our business performance.',
                author: 'Alex T.',
                role: 'Operations Director'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="text-gray-600 mb-4">"{testimonial.quote}"</div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-gray-500 text-sm">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
