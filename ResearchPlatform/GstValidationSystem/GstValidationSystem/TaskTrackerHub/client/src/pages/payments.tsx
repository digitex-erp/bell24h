import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import EscrowWallet from "@/components/payments/escrow-wallet";
import MilestonePayments from "@/components/payments/milestone-payments";
import InvoiceDiscounting from "@/components/payments/invoice-discounting";

export default function Payments() {
  const [activeTab, setActiveTab] = useState("wallet");
  
  // Fetch payment data
  const { data: payments, isLoading } = useQuery({ 
    queryKey: ['/api/payments']
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-dark-800">Payments & Financial</h1>
        <p className="mt-1 text-dark-500">Manage your escrow wallet, milestone payments, and invoice discounting</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallet">Escrow Wallet</TabsTrigger>
          <TabsTrigger value="milestones">Milestone Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Discounting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="space-y-6 mt-6">
          <EscrowWallet />
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading transactions...</p>
              ) : payments?.filter(p => p.type === "escrow")?.length ? (
                <div className="space-y-4">
                  {payments
                    .filter(p => p.type === "escrow")
                    .map(payment => (
                      <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">₹{parseFloat(payment.amount).toLocaleString()}</p>
                          <p className="text-sm text-dark-500">
                            {payment.status === "completed" ? "Payment to" : "Escrow hold for"} 
                            {" "}Supplier #{payment.supplierId}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant={
                            payment.status === "completed" ? "success" : 
                            payment.status === "pending" ? "outline" : "secondary"
                          }>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-dark-500 mt-1">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-500">
                  <p>No escrow transactions yet.</p>
                  <Button className="mt-4" variant="outline">Fund Escrow Wallet</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="milestones" className="space-y-6 mt-6">
          <MilestonePayments />
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6 mt-6">
          <InvoiceDiscounting />
        </TabsContent>
      </Tabs>
    </div>
  );
}
