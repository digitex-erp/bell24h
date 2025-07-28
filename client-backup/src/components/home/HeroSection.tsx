// src/app/components/home/HeroSection.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { getStats } from '@/services/api/stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { TrustBadges } from '@/components/ui/trust-badges';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Image from 'next/image';

export const HeroSection = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // Add lazy loading for stats counters
  const [loadedStats, setLoadedStats] = useState([false, false, false]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadedStats(prev => [true, prev[1], prev[2]]), 300),
      setTimeout(() => setLoadedStats(prev => [prev[0], true, prev[2]]), 600),
      setTimeout(() => setLoadedStats(prev => [prev[0], prev[1], true]), 900)
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('hero.subtitle')}
            </p>

            {/* Stats Counter */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-card p-4 rounded-lg shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  {t('hero.activeSuppliers')}
                </p>
                <p className="text-2xl font-bold">
                  {loadedStats[0] ? (stats?.activeSuppliers.toLocaleString() || '0') : '...'}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card p-4 rounded-lg shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  {t('hero.activeRFQs')}
                </p>
                <p className="text-2xl font-bold">
                  {loadedStats[1] ? (stats?.activeRFQs.toLocaleString() || '0') : '...'}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card p-4 rounded-lg shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  {t('hero.completedTransactions')}
                </p>
                <p className="text-2xl font-bold">
                  {loadedStats[2] ? (stats?.completedTransactions.toLocaleString() || '0') : '...'}
                </p>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                aria-label="Get started with Bell24H"
              >
                {t('hero.getStarted')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                aria-label="Learn more about Bell24H"
              >
                {t('hero.learnMore')}
              </Button>
            </div>

            {/* Trust Badges */}
            <TrustBadges />
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-gray-500">Active Suppliers</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">4.9/5</div>
                <div className="text-gray-500">User Rating</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">99%</div>
                <div className="text-gray-500">Satisfaction</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="relative aspect-square">
              <Image 
                src="/images/hero-illustration.svg" 
                alt="Bell24H B2B Marketplace Platform"
                width={800}
                height={800}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video autoPlay muted loop className="w-full h-full object-cover opacity-20">
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
};
