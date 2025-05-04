import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth-context";
import { AppShell } from "@/components/layout/app-shell";

// Pages
import Dashboard from "@/pages/dashboard";
import Rfqs from "@/pages/rfqs";
import Products from "@/pages/products";
import Analytics from "@/pages/analytics";
import Messages from "@/pages/messages";
import Wallet from "@/pages/wallet";
import Logistics from "@/pages/logistics";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="*">
          <Login />
        </Route>
      </Switch>
    );
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/rfqs" component={Rfqs} />
        <Route path="/products" component={Products} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/messages" component={Messages} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/logistics" component={Logistics} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
