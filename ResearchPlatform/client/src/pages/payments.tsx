import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KredXIntegration from "@/components/payment/KredXIntegration";
import BlockchainPayment from "@/components/payment/BlockchainPayment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Payment System | Bell24h</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payment System</h1>
        <p className="text-muted-foreground mt-2">
          Access invoice financing through KredX and secure blockchain-based payment features
        </p>
      </div>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Feature in Development</AlertTitle>
        <AlertDescription>
          KredX integration is 65% complete and blockchain payment integration is 55% complete.
          Some functionality may be limited.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="kredx" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="kredx">KredX Invoice Discounting</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kredx">
          <KredXIntegration />
        </TabsContent>
        
        <TabsContent value="blockchain">
          <BlockchainPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
}
