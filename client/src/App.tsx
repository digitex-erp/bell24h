import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import RFQPage from "@/pages/rfq-page";
import BidsPage from "@/pages/bids-page";
import ContractsPage from "@/pages/contracts-page";
import MessagesPage from "@/pages/messages-page";
import WalletPage from "@/pages/wallet-page";
import AnalyticsPage from "@/pages/analytics-page";
import VoiceAnalyticsPage from "@/pages/voice-analytics-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/rfqs" component={RFQPage} />
      <ProtectedRoute path="/bids" component={BidsPage} />
      <ProtectedRoute path="/contracts" component={ContractsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/voice-analytics" component={VoiceAnalyticsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
