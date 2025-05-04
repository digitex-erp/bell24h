import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import RFQTable from "@/components/dashboard/RFQTable";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import TradingAnalytics from "@/components/dashboard/TradingAnalytics";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useState } from "react";
import CreateRFQModal from "@/components/modals/CreateRFQModal";
import { FloatingVoiceButton } from "@/components/voice/FloatingVoiceButton";

export default function Dashboard() {
  const [showCreateRFQModal, setShowCreateRFQModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Header title="Dashboard" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => setShowCreateRFQModal(true)}
              className="bg-primary-DEFAULT hover:bg-primary-dark"
            >
              <Zap className="mr-2 h-4 w-4" />
              Create New RFQ
            </Button>
          </div>
          
          <div className="py-6">
            <DashboardOverview />
          </div>
          
          <div className="pb-6">
            <RFQTable />
          </div>
          
          <div className="mb-6">
            <AIRecommendations />
          </div>
          
          <div className="pb-10">
            <TradingAnalytics />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-col md:flex-row">
              <div className="flex items-center space-x-1">
                <p className="text-sm text-neutral-500">&copy; 2023 Bell24h RFQ Marketplace</p>
                <span className="text-neutral-300">|</span>
                <a href="#" className="text-sm text-neutral-500 hover:text-neutral-700">Privacy Policy</a>
                <span className="text-neutral-300">|</span>
                <a href="#" className="text-sm text-neutral-500 hover:text-neutral-700">Terms of Service</a>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-neutral-500">Powered by Bell24h AI</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Create RFQ Modal */}
      <CreateRFQModal 
        isOpen={showCreateRFQModal} 
        onClose={() => setShowCreateRFQModal(false)} 
      />

      {/* Voice Assistant Floating Button */}
      <FloatingVoiceButton />
    </div>
  );
}
