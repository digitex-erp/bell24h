import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Suppliers from "@/pages/suppliers";
import Rfqs from "@/pages/rfqs";
import Analytics from "@/pages/analytics";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/rfqs" component={Rfqs} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/payments" component={Payments} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <AppLayout>
            <Router />
          </AppLayout>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
