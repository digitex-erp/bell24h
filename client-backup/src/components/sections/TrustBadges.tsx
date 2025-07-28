import React from 'react';
import { motion } from 'framer-motion';

export const TrustBadges: React.FC = () => {
  const badges = [
    { icon: '🔒', text: 'SSL Secured', description: '256-bit encryption' },
    { icon: '✅', text: 'ISO Certified', description: 'ISO 27001 compliant' },
    { icon: '🏆', text: 'Award Winning', description: 'Best B2B Platform 2024' },
    { icon: '🌍', text: 'Global Reach', description: '150+ countries' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12"
    >
      {badges.map((badge, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">{badge.icon}</div>
          <div className="text-white font-semibold text-sm">{badge.text}</div>
          <div className="text-blue-100 text-xs">{badge.description}</div>
        </div>
      ))}
    </motion.div>
  );
}; 