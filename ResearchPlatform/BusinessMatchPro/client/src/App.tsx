import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/hooks/use-websocket";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import RfqPage from "@/pages/rfq-page";
import SuppliersPage from "@/pages/suppliers-page";
import DashboardPage from "@/pages/dashboard-page";
import WalletPage from "@/pages/wallet-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/suppliers" component={SuppliersPage} />
      <ProtectedRoute path="/rfq" component={RfqPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
