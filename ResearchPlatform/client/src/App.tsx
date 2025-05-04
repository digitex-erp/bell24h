import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { webSocketService } from "./lib/websocket";
import { BellSoundEffects } from "./lib/audio";

// Pages
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import IndustryTrends from "@/pages/industry-trends";
import RfqCategorization from "@/pages/rfq-categorization";
import GlobalTradeInsights from "@/pages/global-trade-insights";
import StockAnalysis from "@/pages/stock-analysis";
import Alerts from "@/pages/alerts";
import AudioTest from "@/pages/audio-test";
import GeminiAI from "@/pages/gemini-ai";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/industry-trends" component={IndustryTrends} />
      <Route path="/rfq-categorization" component={RfqCategorization} />
      <Route path="/global-trade-insights" component={GlobalTradeInsights} />
      <Route path="/stock-analysis" component={StockAnalysis} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/audio-test" component={AudioTest} />
      <Route path="/gemini-ai" component={GeminiAI} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Track whether audio has been initialized
  const audioInitializedRef = useRef(false);
  
  // Initialize WebSocket connection and audio
  useEffect(() => {
    // Initialize WebSocket
    webSocketService.connect();
    
    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      if (!audioInitializedRef.current) {
        BellSoundEffects.initialize();
        audioInitializedRef.current = true;
        // Remove listeners after initialization
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };
    
    // Add listeners for first user interaction
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      // Clean up WebSocket
      webSocketService.disconnect();
      
      // Clean up audio event listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
