import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RFQList } from "@/components/dashboard/rfq-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Rfq } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const { connected } = useWebSocket();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("rfqs");
  const [testingWs, setTestingWs] = useState(false);

  const { data: rfqs, isLoading: rfqsLoading } = useQuery<Rfq[]>({
    queryKey: ["/api/rfqs/user"],
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery<any[]>({
    queryKey: ["/api/quotes/user"],
    enabled: user?.role === "supplier",
  });

  const testWebSocket = async () => {
    setTestingWs(true);
    try {
      const res = await apiRequest("GET", "/api/test-websocket");
      const data = await res.json();

      toast({
        title: "WebSocket Test Initiated",
        description: "Check for real-time notifications in a moment",
        variant: "default",
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/rfqs/user"] });
        setTestingWs(false);
      }, 2000);
    } catch (error) {
      console.error("Error testing WebSocket:", error);
      toast({
        title: "WebSocket Test Failed",
        description: "Check console for more details",
        variant: "destructive",
      });
      setTestingWs(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.name || user?.username}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md">
                <span className="text-sm font-medium">WebSocket:</span>
                {connected ? (
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Disconnected</span>
                )}
              </div>

              <Button
                onClick={testWebSocket}
                disabled={testingWs || !connected}
                className="flex gap-1 items-center"
              >
                {testingWs ? "Testing..." : "Test WebSocket"}
              </Button>
            </div>
          </div>

          <DashboardStats
            rfqs={rfqs || []}
            isSupplier={user?.role === "supplier"}
            walletBalance={user?.walletBalance || "0"}
          />

          <div className="mt-8">
            <Tabs defaultValue="rfqs" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="rfqs">
                  {user?.role === "buyer" ? "My RFQs" : "Available RFQs"}
                </TabsTrigger>
                {user?.role === "supplier" && (
                  <TabsTrigger value="quotes">My Quotes</TabsTrigger>
                )}
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="rfqs">
                <RFQList
                  rfqs={rfqs || []}
                  isLoading={rfqsLoading}
                  isSupplier={user?.role === "supplier"}
                />
              </TabsContent>

              {user?.role === "supplier" && (
                <TabsContent value="quotes">
                  {quotesLoading ? (
                    <div className="text-center py-8">Loading your quotes...</div>
                  ) : quotes && quotes.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Quotes you've submitted</h3>
                      {/* Quote list component would go here */}
                      <div className="text-center py-8">
                        <p>Quotes functionality is coming soon.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="font-medium text-lg mb-2">No quotes submitted yet</h3>
                      <p className="text-gray-500">
                        Browse available RFQs and submit quotes to potential buyers.
                      </p>
                    </div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="messages">
                <div className="text-center py-8">
                  <h3 className="font-medium text-lg mb-2">Messaging Center</h3>
                  <p className="text-gray-500">
                    Messaging functionality is coming soon. You'll be able to communicate with buyers and suppliers directly.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}