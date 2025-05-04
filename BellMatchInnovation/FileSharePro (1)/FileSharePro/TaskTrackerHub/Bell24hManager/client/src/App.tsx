import { Switch, Route } from "wouter";
import { useAuth } from "./hooks/use-auth";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import CreateRFQ from "@/pages/rfq/create";
import RFQList from "@/pages/rfq/list";
import RFQDetail from "@/pages/rfq/detail";
import RFQRecommendations from "@/pages/rfq/recommendations";
import Analytics from "@/pages/analytics";
import VoiceAssistant from "@/pages/voice-assistant";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {isAuthenticated ? (
        // Protected routes
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/rfq/create" component={CreateRFQ} />
          <Route path="/rfq/list" component={RFQList} />
          <Route path="/rfq/:id" component={RFQDetail} />
          <Route path="/rfq/:id/recommendations" component={RFQRecommendations} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/voice-assistant" component={VoiceAssistant} />
        </>
      ) : (
        // Public routes
        <>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
