import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderBookLevel, TradingPair } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderBookProps {
  pair: TradingPair;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  onPlaceOrder?: (side: 'buy' | 'sell', price: number, quantity: number) => void;
}

export const OrderBook = ({ pair, bids, asks, onPlaceOrder }: OrderBookProps) => {
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [total, setTotal] = useState<string>('0');

  // Calculate total when price or quantity changes
  useEffect(() => {
    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);
    
    if (!isNaN(priceNum) && !isNaN(quantityNum)) {
      setTotal((priceNum * quantityNum).toFixed(2));
    } else {
      setTotal('0');
    }
  }, [price, quantity]);

  const handlePriceSelect = (price: number) => {
    setPrice(price.toString());
  };

  const handlePlaceOrder = () => {
    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);
    
    if (!isNaN(priceNum) && !isNaN(quantityNum) && onPlaceOrder) {
      onPlaceOrder(selectedTab, priceNum, quantityNum);
      // Clear form after placing order
      setQuantity('');
    }
  };

  // Determine the highest volume for highlighting
  const maxBidVolume = Math.max(...bids.map((bid) => bid.quantity), 0);
  const maxAskVolume = Math.max(...asks.map((ask) => ask.quantity), 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Order Book - {pair.baseAsset}/{pair.quoteAsset}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <div className="text-sm font-medium mb-2 text-neutral-500">Bids</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-right">Price</TableHead>
                  <TableHead className="w-1/3 text-right">Amount</TableHead>
                  <TableHead className="w-1/3 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid, index) => (
                  <TableRow 
                    key={index}
                    className="cursor-pointer hover:bg-neutral-100"
                    onClick={() => handlePriceSelect(bid.price)}
                  >
                    <TableCell 
                      className="text-right font-medium text-green-600"
                      style={{
                        background: `linear-gradient(to left, rgba(0, 255, 0, ${bid.quantity / maxBidVolume * 0.2}), transparent)`,
                      }}
                    >
                      {bid.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{bid.quantity.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{bid.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium mb-2 text-neutral-500">Asks</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-right">Price</TableHead>
                  <TableHead className="w-1/3 text-right">Amount</TableHead>
                  <TableHead className="w-1/3 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asks.map((ask, index) => (
                  <TableRow 
                    key={index}
                    className="cursor-pointer hover:bg-neutral-100"
                    onClick={() => handlePriceSelect(ask.price)}
                  >
                    <TableCell 
                      className="text-right font-medium text-red-600"
                      style={{
                        background: `linear-gradient(to left, rgba(255, 0, 0, ${ask.quantity / maxAskVolume * 0.2}), transparent)`,
                      }}
                    >
                      {ask.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{ask.quantity.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{ask.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Order form */}
        <div className="mt-6 border-t pt-4">
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="pt-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Price ({pair.quoteAsset})</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={pair.minPrice}
                    max={pair.maxPrice}
                    step={pair.tickSize}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Amount ({pair.baseAsset})</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={pair.minQty}
                    max={pair.maxQty}
                    step={pair.stepSize}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Total ({pair.quoteAsset})</label>
                  <Input
                    type="text"
                    readOnly
                    value={total}
                  />
                </div>
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  onClick={handlePlaceOrder}
                  disabled={!price || !quantity}
                >
                  Buy {pair.baseAsset}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="sell" className="pt-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Price ({pair.quoteAsset})</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={pair.minPrice}
                    max={pair.maxPrice}
                    step={pair.tickSize}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Amount ({pair.baseAsset})</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={pair.minQty}
                    max={pair.maxQty}
                    step={pair.stepSize}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Total ({pair.quoteAsset})</label>
                  <Input
                    type="text"
                    readOnly
                    value={total}
                  />
                </div>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600" 
                  onClick={handlePlaceOrder}
                  disabled={!price || !quantity}
                >
                  Sell {pair.baseAsset}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};