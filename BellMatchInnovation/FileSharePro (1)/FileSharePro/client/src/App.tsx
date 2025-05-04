import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";

import Dashboard from "@/pages/Dashboard";
import MyRFQs from "@/pages/MyRFQs";
import Messages from "@/pages/Messages";
import Suppliers from "@/pages/Suppliers";
import Analytics from "@/pages/Analytics";
import Payments from "@/pages/Payments";
import Trading from "@/pages/Trading";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/layout/AppShell";
import ChatWidget from "@/components/chat/ChatWidget";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/user");
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {!user ? (
            <>
              <Route path="/login">
                <Login onLogin={handleLogin} />
              </Route>
              <Route path="/register">
                <Register />
              </Route>
              <Route path="*">
                <Login onLogin={handleLogin} />
              </Route>
            </>
          ) : (
            <>
              <Route path="/">
                <AppShell user={user} onLogout={handleLogout}>
                  <Dashboard user={user} />
                </AppShell>
              </Route>
              <Route path="/my-rfqs">
                <AppShell user={user} onLogout={handleLogout}>
                  <MyRFQs user={user} />
                </AppShell>
              </Route>
              <Route path="/messages">
                <AppShell user={user} onLogout={handleLogout}>
                  <Messages user={user} />
                </AppShell>
              </Route>
              <Route path="/suppliers">
                <AppShell user={user} onLogout={handleLogout}>
                  <Suppliers user={user} />
                </AppShell>
              </Route>
              <Route path="/analytics">
                <AppShell user={user} onLogout={handleLogout}>
                  <Analytics user={user} />
                </AppShell>
              </Route>
              <Route path="/payments">
                <AppShell user={user} onLogout={handleLogout}>
                  <Payments user={user} />
                </AppShell>
              </Route>
              <Route path="/trading">
                <AppShell user={user} onLogout={handleLogout}>
                  <Trading />
                </AppShell>
              </Route>
              <Route path="/settings">
                <AppShell user={user} onLogout={handleLogout}>
                  <Settings user={user} />
                </AppShell>
              </Route>
              <Route path="*">
                <AppShell user={user} onLogout={handleLogout}>
                  <NotFound />
                </AppShell>
              </Route>
            </>
          )}
        </Switch>
        {user && <ChatWidget user={user} />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
