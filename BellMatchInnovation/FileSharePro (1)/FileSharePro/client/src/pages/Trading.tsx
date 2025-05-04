import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { 
  TradingPair, 
  TradingOrder, 
  TradingAlert, 
  OrderBookLevel, 
  MarketDepthEntry,
  OrderType,
  OrderSide 
} from "../types";
import { OrderBook } from "../components/trading/OrderBook";
import { MarketDepth } from "../components/trading/MarketDepth";
import { AdvancedOrderForm } from "../components/trading/AdvancedOrderForm";
import { TradingAlerts } from "../components/trading/TradingAlerts";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowDownUp, History } from "lucide-react";

export default function Trading() {
  const { toast } = useToast();
  const [selectedPairId, setSelectedPairId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'spot' | 'margin'>('spot');

  // Fetch available trading pairs
  const { data: tradingPairs, isLoading: loadingPairs } = useQuery<TradingPair[]>({
    queryKey: ['/api/trading/pairs'],
    enabled: true,
  });

  // Fetch orders for the selected pair
  const { data: orders, isLoading: loadingOrders } = useQuery<TradingOrder[]>({
    queryKey: ['/api/trading/orders', selectedPairId],
    enabled: !!selectedPairId,
  });

  // Fetch alerts
  const { data: alerts, isLoading: loadingAlerts } = useQuery<TradingAlert[]>({
    queryKey: ['/api/trading/alerts'],
    enabled: true,
  });

  // Fetch order book for the selected pair
  const { data: orderBook, isLoading: loadingOrderBook } = useQuery<{
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  }>({
    queryKey: ['/api/trading/orderbook', selectedPairId],
    enabled: !!selectedPairId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch market depth for the selected pair
  const { data: marketDepth, isLoading: loadingMarketDepth } = useQuery<MarketDepthEntry[]>({
    queryKey: ['/api/trading/depth', selectedPairId],
    enabled: !!selectedPairId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Set default selected pair when data is loaded
  useEffect(() => {
    if (tradingPairs && tradingPairs.length > 0 && !selectedPairId) {
      setSelectedPairId(tradingPairs[0].id);
    }
  }, [tradingPairs, selectedPairId]);

  // Get the currently selected pair object
  const selectedPair = tradingPairs?.find(pair => pair.id === selectedPairId);

  // Handle order placement
  const handlePlaceOrder = async (
    side: OrderSide, 
    orderType: OrderType, 
    price: number, 
    quantity: number, 
    options: any
  ) => {
    if (!selectedPairId) return;

    try {
      const response = await apiRequest('POST', '/api/trading/orders', {
        pairId: selectedPairId,
        side,
        type: orderType,
        price,
        quantity,
        ...options
      });

      toast({
        title: "Order Placed",
        description: `Your ${side} order has been placed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: `There was an error placing your order. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Handle simple order from order book
  const handleSimpleOrder = async (side: OrderSide, price: number, quantity: number) => {
    if (!selectedPairId) return;

    try {
      const response = await apiRequest('POST', '/api/trading/orders', {
        pairId: selectedPairId,
        side,
        type: 'limit',
        price,
        quantity
      });

      toast({
        title: "Order Placed",
        description: `Your ${side} order has been placed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: `There was an error placing your order. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Handle creating an alert
  const handleCreateAlert = async (alertData: any) => {
    try {
      const response = await apiRequest('POST', '/api/trading/alerts', alertData);

      toast({
        title: "Alert Created",
        description: "Your alert has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Alert Failed",
        description: "There was an error creating your alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting an alert
  const handleDeleteAlert = async (alertId: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/trading/alerts/${alertId}`);

      toast({
        title: "Alert Deleted",
        description: "Your alert has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "There was an error deleting your alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle toggling an alert
  const handleToggleAlert = async (alertId: number, isActive: boolean) => {
    try {
      const response = await apiRequest('PATCH', `/api/trading/alerts/${alertId}`, {
        isActive
      });

      toast({
        title: isActive ? "Alert Activated" : "Alert Deactivated",
        description: `Your alert has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "There was an error updating your alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loading = loadingPairs || (selectedPairId && (loadingOrders || loadingOrderBook || loadingMarketDepth));

  if (loading && !tradingPairs) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Trading</h1>
          <p className="text-neutral-500 mt-1">
            Trade with advanced order types and real-time market data.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="min-w-[200px]">
            <Select 
              onValueChange={(value) => setSelectedPairId(parseInt(value))}
              defaultValue={selectedPairId?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                {tradingPairs?.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id.toString()}>
                    {pair.baseAsset}/{pair.quoteAsset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'spot' | 'margin')}>
            <TabsList>
              <TabsTrigger value="spot">Spot</TabsTrigger>
              <TabsTrigger value="margin">Margin</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {selectedPair ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Order book and depth chart */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order book */}
              <div className="md:col-span-1">
                {orderBook ? (
                  <OrderBook 
                    pair={selectedPair}
                    bids={orderBook.bids || []}
                    asks={orderBook.asks || []}
                    onPlaceOrder={handleSimpleOrder}
                  />
                ) : (
                  <Card className="w-full h-[400px] flex items-center justify-center">
                    <CardContent>
                      <div className="text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400" />
                        <p className="mt-2 text-neutral-500">
                          Order book data not available
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Market depth */}
              <div className="md:col-span-1">
                {marketDepth ? (
                  <MarketDepth 
                    pair={selectedPair}
                    depthData={marketDepth}
                  />
                ) : (
                  <Card className="w-full h-[400px] flex items-center justify-center">
                    <CardContent>
                      <div className="text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400" />
                        <p className="mt-2 text-neutral-500">
                          Market depth data not available
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Advanced order form */}
            <AdvancedOrderForm 
              pair={selectedPair}
              onPlaceOrder={handlePlaceOrder}
            />
            
            {/* Open orders */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Open Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Type</th>
                          <th className="text-left pb-2">Side</th>
                          <th className="text-right pb-2">Price</th>
                          <th className="text-right pb-2">Amount</th>
                          <th className="text-right pb-2">Filled</th>
                          <th className="text-right pb-2">Created</th>
                          <th className="text-right pb-2">Status</th>
                          <th className="text-right pb-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="py-2">{order.type}</td>
                            <td className={`py-2 ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                              {order.side}
                            </td>
                            <td className="py-2 text-right">{order.price?.toFixed(2) || 'Market'}</td>
                            <td className="py-2 text-right">{order.quantity.toFixed(4)}</td>
                            <td className="py-2 text-right">{((order.filledQuantity / order.quantity) * 100).toFixed(1)}%</td>
                            <td className="py-2 text-right">{new Date(order.createdAt).toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs
                                ${order.status === 'open' ? 'bg-blue-100 text-blue-700' : 
                                  order.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 
                                  order.status === 'filled' ? 'bg-green-100 text-green-700' : 
                                  'bg-neutral-100 text-neutral-700'}
                              `}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Cancel Order",
                                    description: "This functionality is not yet implemented.",
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-500">
                    <ArrowDownUp className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                    <p>No open orders</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column: Trading alerts and position info */}
          <div className="lg:col-span-4 space-y-6">
            <TradingAlerts 
              tradingPairs={tradingPairs || []}
              userAlerts={alerts || []}
              onCreateAlert={handleCreateAlert}
              onDeleteAlert={handleDeleteAlert}
              onToggleAlert={handleToggleAlert}
            />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPair && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-neutral-500">24h High</div>
                        <div className="text-lg font-medium">
                          {selectedPair.maxPrice.toFixed(2)} {selectedPair.quoteAsset}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">24h Low</div>
                        <div className="text-lg font-medium">
                          {selectedPair.minPrice.toFixed(2)} {selectedPair.quoteAsset}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm text-neutral-500">Trading Pair Info</div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Min Order Size:</span>
                          <span>{selectedPair.minQty} {selectedPair.baseAsset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Order Size:</span>
                          <span>{selectedPair.maxQty} {selectedPair.baseAsset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price Tick Size:</span>
                          <span>{selectedPair.tickSize} {selectedPair.quoteAsset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity Step:</span>
                          <span>{selectedPair.stepSize} {selectedPair.baseAsset}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPair.description && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm text-neutral-500">About</div>
                          <p className="mt-1 text-sm">
                            {selectedPair.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-neutral-300" />
            <h3 className="mt-2 text-lg font-medium">No Trading Pairs Available</h3>
            <p className="mt-1 text-neutral-500">
              Please check back later or contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}