import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import RfqCreation from '@/components/dashboard/rfq-creation';
import AiMatchedSuppliers from '@/components/dashboard/ai-matched-suppliers';
import MarketInsights from '@/components/dashboard/market-insights';
import WalletSection from '@/components/dashboard/wallet-section';
import KredxSection from '@/components/dashboard/kredx-section';
import RecentActivity from '@/components/dashboard/recent-activity';
import { OneClickSimulator } from '../components/blockchain/one-click-simulator';
import { RecommendationCarousel } from '../components/rfq/recommendation-carousel';
import { getDocumentDirection } from '../lib/translations/cultural-config';

const Dashboard = () => {
  const [userId, setUserId] = useState<number>(1); // Default to user ID 1 for demo
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  // Get current language from local storage or system settings
  useEffect(() => {
    const storedLanguage = localStorage.getItem('bell24h-language') || 'en';
    setCurrentLanguage(storedLanguage);
    
    // In a real app, we would fetch the current user ID from auth
    // For demo purposes, we're using a hardcoded ID
    const fetchCurrentUser = async () => {
      try {
        // Simulating an API call to get current user
        // const response = await fetch('/api/users/me');
        // const userData = await response.json();
        // setUserId(userData.id);
        
        // For demo, we'll just use ID 1 after a slight delay to simulate loading
        setTimeout(() => {
          setUserId(1);
        }, 500);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Apply RTL/LTR direction based on language
  useEffect(() => {
    document.documentElement.dir = getDocumentDirection(currentLanguage);
  }, [currentLanguage]);
  
  return (
    <MainLayout>
      {/* Dashboard Header with Stats */}
      <DashboardStats />
      
      {/* Personalized RFQ Recommendations Carousel */}
      <div className="mb-6">
        <RecommendationCarousel 
          userId={userId} 
          type="personalized" 
          limit={6}
          language={currentLanguage}
        />
      </div>
      
      {/* RFQ Creation Section */}
      <RfqCreation />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2">
          {/* AI Matched Suppliers */}
          <AiMatchedSuppliers />
          
          {/* Trending RFQs Carousel */}
          <div className="mb-6">
            <RecommendationCarousel 
              userId={userId} 
              type="trending" 
              limit={5}
              language={currentLanguage}
            />
          </div>
          
          {/* Market Insights */}
          <MarketInsights />
        </div>
        
        {/* Right Column (Sidebar) */}
        <div>
          {/* Wallet Section */}
          <WalletSection />
          
          {/* KredX Section */}
          <KredxSection />
          
          {/* One-Click Blockchain Simulator */}
          <div className="mt-6">
            <OneClickSimulator />
          </div>
          
          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
