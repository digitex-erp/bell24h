import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SetupWizard from "@/pages/setup-wizard";
import ApiDashboard from "./pages/api-dashboard";
import EmptyStateShowcase from "./pages/empty-state-showcase";
import RfqAnalytics from "./pages/rfq-analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/setup" component={SetupWizard} />
      <Route path="/api-dashboard" component={ApiDashboard} />
      <Route path="/empty-states" component={EmptyStateShowcase} />
      <Route path="/rfq-analytics" component={RfqAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="flex">
            {/* Import and render Navigation component */}
            {/* @ts-ignore */}
            {React.createElement(require('./components/ui/navigation').default)}
            <div className="flex-1 ml-0 md:ml-64 min-h-screen">
              <Router />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
