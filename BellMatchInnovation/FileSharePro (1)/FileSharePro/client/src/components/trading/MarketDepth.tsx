import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketDepthEntry, TradingPair } from "../../types";
import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface ProcessedDepthData {
  price: number;
  bids: number;
  asks: number;
}

interface MarketDepthProps {
  pair: TradingPair;
  depthData: MarketDepthEntry[];
}

export const MarketDepth = ({ pair, depthData }: MarketDepthProps) => {
  // Process market depth data for visualization
  const processedData = React.useMemo(() => {
    // Group entries by price level and calculate cumulative volumes
    const priceMap = new Map<number, ProcessedDepthData>();
    
    // Initialize with zero values
    const bidEntries = depthData.filter(entry => entry.side === 'buy');
    const askEntries = depthData.filter(entry => entry.side === 'sell');
    
    // Sort bids (descending) and asks (ascending)
    const sortedBids = bidEntries.sort((a, b) => b.price - a.price);
    const sortedAsks = askEntries.sort((a, b) => a.price - b.price);
    
    // Calculate cumulative volumes
    let cumulativeBids = 0;
    sortedBids.forEach(bid => {
      cumulativeBids += bid.quantity;
      priceMap.set(bid.price, {
        price: bid.price,
        bids: cumulativeBids,
        asks: 0,
      });
    });
    
    let cumulativeAsks = 0;
    sortedAsks.forEach(ask => {
      cumulativeAsks += ask.quantity;
      const existing = priceMap.get(ask.price);
      if (existing) {
        existing.asks = cumulativeAsks;
      } else {
        priceMap.set(ask.price, {
          price: ask.price,
          bids: 0,
          asks: cumulativeAsks,
        });
      }
    });
    
    // Convert to array and sort by price
    return Array.from(priceMap.values()).sort((a, b) => a.price - b.price);
  }, [depthData]);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatVolume = (volume: number) => {
    return volume.toFixed(4);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="text-sm font-medium text-neutral-900">
            Price: {formatPrice(payload[0].payload.price)} {pair.quoteAsset}
          </p>
          {payload[0].value > 0 && (
            <p className="text-sm text-green-600">
              Cumulative Bids: {formatVolume(payload[0].value)} {pair.baseAsset}
            </p>
          )}
          {payload[1]?.value > 0 && (
            <p className="text-sm text-red-600">
              Cumulative Asks: {formatVolume(payload[1].value)} {pair.baseAsset}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Market Depth - {pair.baseAsset}/{pair.quoteAsset}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                tickFormatter={formatPrice} 
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                tickFormatter={formatVolume}
                domain={[0, 'dataMax']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="bids" 
                stroke="#16a34a" 
                fill="#bbf7d0" 
                fillOpacity={0.7}
                stackId="1"
              />
              <Area 
                type="monotone" 
                dataKey="asks" 
                stroke="#dc2626" 
                fill="#fecaca" 
                fillOpacity={0.7}
                stackId="2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-neutral-500 text-center">
          <div className="flex items-center justify-center">
            <span className="w-3 h-3 bg-green-500 inline-block mr-1"></span>
            <span className="mr-4">Bid Volume</span>
            <span className="w-3 h-3 bg-red-500 inline-block mr-1"></span>
            <span>Ask Volume</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};