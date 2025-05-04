import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BlockchainPayment } from '../components/payments/blockchain-payment';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { apiRequest } from '../lib/queryClient';
import { OneClickSimulator } from '../components/blockchain/one-click-simulator';

export default function BlockchainPaymentPage() {
  const [location, setLocation] = useLocation();
  const [_, params] = useRoute<{ orderId: string }>('/blockchain-payment/:orderId');
  const orderId = params?.orderId ? parseInt(params.orderId) : undefined;
  
  // Fetch order details if order ID is provided
  const { data: orderData, isLoading, isError, error } = useQuery({
    queryKey: ['/api/orders', orderId],
    queryFn: () => apiRequest(`/api/orders/${orderId}`),
    enabled: !!orderId
  });
  
  // Fetch supplier details if supplier ID is provided
  const { data: supplierData } = useQuery({
    queryKey: ['/api/suppliers', orderData?.supplierId],
    queryFn: () => apiRequest(`/api/suppliers/${orderData?.supplierId}`),
    enabled: !!orderData?.supplierId
  });
  
  // Fetch milestones for the order if available
  const { data: milestones } = useQuery({
    queryKey: ['/api/orders', orderId, 'milestones'],
    queryFn: () => apiRequest(`/api/orders/${orderId}/milestones`),
    enabled: !!orderId
  });
  
  // Handle payment completion
  const handlePaymentComplete = () => {
    // Navigate back to the order details page
    if (orderId) {
      setLocation(`/orders/${orderId}`);
    }
  };
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Blockchain Payment</h1>
        <p className="text-muted-foreground">
          Secure and transparent payments using blockchain technology
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load order details'}
            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => setLocation('/orders')}
              >
                Back to Orders
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !orderId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>No Order Selected</CardTitle>
              <CardDescription>
                Select an order to make a blockchain payment or view available orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                To make a real blockchain payment, you need to select an order first. 
                This will allow you to pay suppliers securely using blockchain technology.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setLocation('/orders')}
                className="w-full"
              >
                View Available Orders
              </Button>
            </CardFooter>
          </Card>
          
          <div>
            <h2 className="text-lg font-medium mb-3">Try the Blockchain Demo</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Experience how blockchain payments work with our one-click demo:
            </p>
            <OneClickSimulator />
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {orderData && (
            <Card>
              <CardHeader>
                <CardTitle>Order #{orderData.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Details</p>
                    <p className="font-semibold">{orderData.title || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {orderData.description?.substring(0, 100) || 'No description available'}
                      {orderData.description?.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                    <p className="font-semibold">
                      {supplierData?.name || 'Unknown Supplier'}
                    </p>
                    <p className="text-sm font-mono text-muted-foreground mt-1">
                      {supplierData?.walletAddress 
                        ? `${supplierData.walletAddress.substring(0, 6)}...${supplierData.walletAddress.substring(supplierData.walletAddress.length - 4)}`
                        : 'No wallet address available'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="font-semibold">${orderData.amount || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="font-semibold">{orderData.status || 'Pending'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <BlockchainPayment
            orderId={orderId}
            rfqId={orderData?.rfqId}
            supplierId={orderData?.supplierId}
            supplierAddress={supplierData?.walletAddress || ''}
            totalAmount={orderData?.cryptoAmount?.toString() || '0.01'}
            useMilestones={!!milestones?.length}
            milestones={milestones?.map(m => ({
              id: m.id,
              name: m.title,
              amount: m.cryptoAmount?.toString() || '0',
              completed: m.status === 'completed'
            }))}
            onPaymentComplete={handlePaymentComplete}
          />
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setLocation(orderId ? `/orders/${orderId}` : '/orders')}
            >
              Back to Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}