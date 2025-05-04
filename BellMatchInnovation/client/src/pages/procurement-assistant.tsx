import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegratedProcurementAssistant } from '@/components/chatbot/integrated-procurement-assistant';
import { ContextualChatInterface } from '@/components/chatbot/contextual-chat-interface';
import { useContextualProcurement } from '@/hooks/use-contextual-procurement';
import { Lightbulb, BarChart3, ListChecks, FileText, Settings } from 'lucide-react';

/**
 * Procurement Assistant Page
 * 
 * This page demonstrates the procurement assistant in two ways:
 * 1. As an embedded chat interface
 * 2. As a floating assistant that can be toggled on/off
 */
export default function ProcurementAssistantPage() {
  const [showFloatingAssistant, setShowFloatingAssistant] = useState(true);
  const [selectedTab, setSelectedTab] = useState('chat');
  
  // Get the procurement context hook to simulate setting context
  const procurementContext = useContextualProcurement();
  
  // Handle setting demo RFQ context
  const handleSetDemoRfq = () => {
    procurementContext.setCurrentRfq({
      id: 1001,
      title: "IT Equipment Purchase Q2 2025",
      description: "Seeking quotes for enterprise-grade laptop computers and monitors for our expanding development team.",
      category: "IT Equipment",
      requirements: ["16GB RAM minimum", "15-inch display", "3-year warranty", "Intel i7 or equivalent"],
      deadline: new Date("2025-06-30"),
      budget: "$150,000 - $200,000",
      quantity: 150
    });
  };
  
  // Handle setting demo supplier context
  const handleSetDemoSupplier = () => {
    procurementContext.setCurrentSupplier({
      id: 2001,
      name: "TechSupply Solutions Inc.",
      industry: "IT Equipment",
      products: ["Enterprise Hardware", "Software Licensing", "Technical Support", "Warranty Services"],
      rating: 4.8,
      region: "North America",
      yearsOfPartnership: 5
    });
  };
  
  // Handle clearing contexts
  const handleClearContexts = () => {
    procurementContext.setCurrentRfq(null);
    procurementContext.setCurrentSupplier(null);
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Procurement Assistant Demo</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        This page demonstrates the procurement assistant functionality, which provides context-aware
        AI assistance for procurement teams. The assistant can be integrated directly into pages or
        used as a floating assistant throughout the application.
      </p>
      
      <div className="flex flex-col gap-8 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>
              Use these controls to simulate different procurement contexts for the assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleSetDemoRfq}
              >
                <FileText className="h-4 w-4" />
                <span>Set Demo RFQ Context</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleSetDemoSupplier}
              >
                <ListChecks className="h-4 w-4" />
                <span>Set Demo Supplier Context</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleClearContexts}
              >
                <Settings className="h-4 w-4" />
                <span>Clear All Contexts</span>
              </Button>
              
              <Button 
                variant={showFloatingAssistant ? "default" : "outline"} 
                className="flex items-center gap-2 ml-auto"
                onClick={() => setShowFloatingAssistant(!showFloatingAssistant)}
              >
                <Lightbulb className="h-4 w-4" />
                <span>
                  {showFloatingAssistant ? "Hide" : "Show"} Floating Assistant
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="chat" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Embedded Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Embedded Procurement Assistant</CardTitle>
                <CardDescription>
                  This shows how the procurement assistant can be directly embedded into a page.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ContextualChatInterface userId={1} showToolbar={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Procurement Insights Dashboard</CardTitle>
                <CardDescription>
                  This page demonstrates how the assistant can provide context-aware insights while
                  users are viewing procurement analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-md border p-8 text-center">
                  <div>
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      This is a placeholder for a procurement analytics dashboard.
                      <br />
                      The floating assistant provides context-aware help for this view.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating assistant */}
      {showFloatingAssistant && (
        <IntegratedProcurementAssistant 
          position="bottom-right"
          size="medium"
          initiallyOpen={false}
          userId={1}
        />
      )}
    </div>
  );
}