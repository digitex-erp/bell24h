import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const RealTimeStats: React.FC = () => {
  const [stats, setStats] = useState({
    suppliers: 25000,
    rfqs: 50000,
    countries: 150,
    transactions: 1000000
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        suppliers: prev.suppliers + Math.floor(Math.random() * 3),
        rfqs: prev.rfqs + Math.floor(Math.random() * 5),
        countries: prev.countries,
        transactions: prev.transactions + Math.floor(Math.random() * 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: 'Verified Suppliers', value: stats.suppliers.toLocaleString(), icon: '🏭' },
    { label: 'RFQs Posted', value: stats.rfqs.toLocaleString(), icon: '📋' },
    { label: 'Countries', value: stats.countries.toString(), icon: '🌍' },
    { label: 'Transactions', value: `$${(stats.transactions / 1000000).toFixed(1)}M`, icon: '💰' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 + index * 0.1 }}
          className="text-center"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <motion.div
            key={stat.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            {stat.value}
          </motion.div>
          <div className="text-blue-100 text-sm">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}; 