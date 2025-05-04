import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import CreateRFQ from "@/pages/CreateRFQ";
import VoiceRFQ from "@/pages/VoiceRFQ";
import VideoRFQ from "@/pages/VideoRFQ";
import MyRFQs from "@/pages/MyRFQs";
import Suppliers from "@/pages/Suppliers";
import Messages from "@/pages/Messages";
import Analytics from "@/pages/Analytics";
import Wallet from "@/pages/Wallet";
import Invoices from "@/pages/Invoices";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import { useSelector } from "react-redux";

function Router() {
  // Get auth state from Redux store
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  // If not authenticated, show auth page
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="*" component={Auth} />
      </Switch>
    );
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/create-rfq" component={CreateRFQ} />
        <Route path="/voice-rfq" component={VoiceRFQ} />
        <Route path="/video-rfq" component={VideoRFQ} />
        <Route path="/my-rfqs" component={MyRFQs} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/messages" component={Messages} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
