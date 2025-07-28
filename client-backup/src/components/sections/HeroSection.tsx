import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrustBadges } from './TrustBadges';
import { LanguageToggle } from './LanguageToggle';
import { RealTimeStats } from './RealTimeStats';

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Connect with Global Suppliers",
      subtitle: "Find verified suppliers for your business needs",
      cta: "Start Sourcing Now"
    },
    {
      title: "Submit RFQs with Voice & Video",
      subtitle: "Advanced AI-powered requirement matching",
      cta: "Create RFQ"
    },
    {
      title: "Secure Escrow Payments",
      subtitle: "Blockchain-powered transaction security",
      cta: "Learn More"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, #06b6d4 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="Bell24H" className="h-10 w-auto" />
          <span className="text-white text-xl font-bold">Bell24H</span>
        </div>
        <LanguageToggle />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {heroSlides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl transition-all"
              >
                {heroSlides[currentSlide].cta}
              </motion.button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-full text-lg font-semibold transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Real-time Stats */}
          <RealTimeStats />
          
          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}; 