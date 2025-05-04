import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TradingPair, OrderType } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedOrderFormProps {
  pair: TradingPair;
  onPlaceOrder?: (
    side: 'buy' | 'sell',
    orderType: OrderType,
    price: number,
    quantity: number,
    options: {
      stopPrice?: number;
      leverage?: number;
      takeProfitPrice?: number;
      stopLossPrice?: number;
      expiresAt?: Date;
      iceberg?: boolean;
      icebergQty?: number;
    }
  ) => void;
}

export const AdvancedOrderForm = ({ pair, onPlaceOrder }: AdvancedOrderFormProps) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [total, setTotal] = useState<string>('0');
  
  // Advanced options
  const [leverage, setLeverage] = useState<number>(1);
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [expiryHours, setExpiryHours] = useState<string>('');
  const [useIceberg, setUseIceberg] = useState<boolean>(false);
  const [icebergQuantity, setIcebergQuantity] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Calculate total when price, quantity, or leverage changes
  useEffect(() => {
    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);
    
    if (!isNaN(priceNum) && !isNaN(quantityNum)) {
      const totalValue = (priceNum * quantityNum);
      // For margin trading, divide by leverage
      const adjustedTotal = orderType === 'market' ? totalValue : (totalValue / leverage);
      setTotal(adjustedTotal.toFixed(2));
    } else {
      setTotal('0');
    }
  }, [price, quantity, leverage, orderType]);

  // Reset fields when order type changes
  useEffect(() => {
    switch (orderType) {
      case 'market':
        setPrice('');
        setStopPrice('');
        break;
      case 'limit':
        setStopPrice('');
        break;
      case 'stop':
      case 'stop_limit':
        // Keep fields
        break;
      case 'trailing_stop':
        setPrice('');
        break;
      case 'oco':
        // One-Cancels-the-Other requires both limit and stop prices
        break;
      case 'iceberg':
        setUseIceberg(true);
        break;
      default:
        break;
    }
  }, [orderType]);

  const handlePlaceOrder = () => {
    // Basic validation
    if (
      (orderType === 'limit' && !price) ||
      (orderType === 'stop' && !stopPrice) ||
      (orderType === 'stop_limit' && (!price || !stopPrice)) ||
      !quantity
    ) {
      return; // Don't proceed if required fields are missing
    }

    const priceNum = parseFloat(price);
    const stopPriceNum = parseFloat(stopPrice);
    const quantityNum = parseFloat(quantity);
    
    if (onPlaceOrder) {
      // Calculate expiry date from hours if provided
      const expiresAt = expiryHours 
        ? new Date(Date.now() + (parseInt(expiryHours) * 60 * 60 * 1000)) 
        : undefined;

      onPlaceOrder(
        side, 
        orderType,
        priceNum,
        quantityNum,
        {
          stopPrice: !isNaN(stopPriceNum) ? stopPriceNum : undefined,
          leverage,
          takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
          stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
          expiresAt,
          iceberg: useIceberg,
          icebergQty: useIceberg && icebergQuantity ? parseFloat(icebergQuantity) : undefined
        }
      );
      
      // Reset form
      setQuantity('');
      if (orderType !== 'limit') {
        setPrice('');
      }
      if (orderType !== 'stop' && orderType !== 'stop_limit') {
        setStopPrice('');
      }
      setTakeProfitPrice('');
      setStopLossPrice('');
      setExpiryHours('');
      setIcebergQuantity('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Advanced Order - {pair.baseAsset}/{pair.quoteAsset}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Side selection tabs */}
        <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="buy"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger 
              value="sell"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Order type selection */}
        <div className="mb-4">
          <Label>Order Type</Label>
          <Select 
            value={orderType} 
            onValueChange={(value) => setOrderType(value as OrderType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select order type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
              <SelectItem value="stop">Stop</SelectItem>
              <SelectItem value="stop_limit">Stop Limit</SelectItem>
              <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
              <SelectItem value="oco">OCO (One-Cancels-the-Other)</SelectItem>
              <SelectItem value="iceberg">Iceberg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order parameters based on type */}
        <div className="space-y-4">
          {/* Limit Price - for limit, stop-limit, OCO */}
          {(orderType === 'limit' || orderType === 'stop_limit' || orderType === 'oco' || orderType === 'iceberg') && (
            <div>
              <Label>Price ({pair.quoteAsset})</Label>
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
          )}
          
          {/* Stop Price - for stop, stop-limit, trailing-stop, OCO */}
          {(orderType === 'stop' || orderType === 'stop_limit' || orderType === 'trailing_stop' || orderType === 'oco') && (
            <div>
              <Label>
                {orderType === 'trailing_stop' ? 'Trailing Distance' : 'Stop Price'} ({pair.quoteAsset})
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                min={orderType === 'trailing_stop' ? 0.01 : pair.minPrice}
                max={orderType === 'trailing_stop' ? undefined : pair.maxPrice}
                step={pair.tickSize}
              />
            </div>
          )}
          
          {/* Quantity */}
          <div>
            <Label>Amount ({pair.baseAsset})</Label>
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
          
          {/* Total cost */}
          <div>
            <Label>Total {leverage > 1 ? '(margin required)' : ''} ({pair.quoteAsset})</Label>
            <Input
              type="text"
              readOnly
              value={total}
            />
          </div>

          {/* Advanced options toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              checked={showAdvancedOptions}
              onCheckedChange={setShowAdvancedOptions}
              id="advanced-options"
            />
            <Label htmlFor="advanced-options">Advanced Options</Label>
          </div>

          {/* Advanced options panel */}
          {showAdvancedOptions && (
            <div className="mt-4 p-4 border rounded-md bg-slate-50">
              <div className="space-y-4">
                {/* Leverage slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Leverage: {leverage}x</Label>
                    <span className="text-xs text-neutral-500">{leverage > 1 ? 'Margin Trading' : 'Spot Trading'}</span>
                  </div>
                  <Slider
                    defaultValue={[1]}
                    min={1}
                    max={10}
                    step={1}
                    value={[leverage]}
                    onValueChange={(value) => setLeverage(value[0])}
                  />
                </div>

                {/* Take Profit */}
                <div>
                  <Label>Take Profit Price ({pair.quoteAsset})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    min={side === 'buy' ? (price ? parseFloat(price) : 0) : 0.01}
                    step={pair.tickSize}
                  />
                </div>

                {/* Stop Loss */}
                <div>
                  <Label>Stop Loss Price ({pair.quoteAsset})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    max={side === 'buy' ? (price ? parseFloat(price) : undefined) : undefined}
                    step={pair.tickSize}
                  />
                </div>

                {/* Order expiry */}
                <div>
                  <Label>Order Expires After (hours, blank for GTC)</Label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(e.target.value)}
                    min={1}
                  />
                </div>

                {/* Iceberg options */}
                {(orderType === 'iceberg' || useIceberg) && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={useIceberg}
                        onCheckedChange={setUseIceberg}
                        id="use-iceberg"
                        disabled={orderType === 'iceberg'}
                      />
                      <Label htmlFor="use-iceberg">Iceberg Order</Label>
                    </div>
                    
                    {useIceberg && (
                      <div>
                        <Label>Visible Quantity (per slice)</Label>
                        <Input
                          type="number"
                          placeholder="Max visible quantity"
                          value={icebergQuantity}
                          onChange={(e) => setIcebergQuantity(e.target.value)}
                          min={pair.minQty}
                          max={quantity ? parseFloat(quantity) : pair.maxQty}
                          step={pair.stepSize}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Only a portion of your order will be visible to the market at any time.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Place order button */}
          <Button 
            className={`w-full ${side === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            onClick={handlePlaceOrder}
            disabled={
              (orderType === 'limit' && !price) ||
              (orderType === 'stop' && !stopPrice) ||
              (orderType === 'stop_limit' && (!price || !stopPrice)) ||
              !quantity
            }
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {pair.baseAsset}
            {orderType !== 'market' && ` @ ${orderType.replace('_', ' ')}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};