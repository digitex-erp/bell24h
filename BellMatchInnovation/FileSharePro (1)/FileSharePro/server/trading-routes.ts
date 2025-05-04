import { Request, Response } from "express";
import { db } from "./db";
import { 
  tradingPairs, 
  tradingOrders, 
  tradingPositions, 
  tradingAlerts,
  marketDepth,
  orderTypeEnum,
  orderSideEnum,
  orderStatusEnum
} from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Type aliases from schema enums
type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop' | 'oco' | 'iceberg';
type OrderSide = 'buy' | 'sell';
type OrderStatus = 'open' | 'partial' | 'filled' | 'cancelled' | 'rejected' | 'expired';

// Mock data (for demonstration until connected to real market data)
const generateMockPairs = () => {
  return [
    {
      id: 1,
      baseAsset: "BTC",
      quoteAsset: "USDT",
      minQty: 0.0001,
      maxQty: 100,
      stepSize: 0.0001,
      minPrice: 1000,
      maxPrice: 100000,
      tickSize: 0.01,
      isActive: true,
      description: "Bitcoin to Tether trading pair",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      baseAsset: "ETH",
      quoteAsset: "USDT",
      minQty: 0.001,
      maxQty: 1000,
      stepSize: 0.001,
      minPrice: 100,
      maxPrice: 10000,
      tickSize: 0.01,
      isActive: true,
      description: "Ethereum to Tether trading pair",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      baseAsset: "XRP",
      quoteAsset: "USDT",
      minQty: 1,
      maxQty: 100000,
      stepSize: 1,
      minPrice: 0.1,
      maxPrice: 10,
      tickSize: 0.0001,
      isActive: true,
      description: "Ripple to Tether trading pair",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

const generateMockOrders = (userId: number) => {
  return [
    {
      id: 1,
      userId: userId,
      pairId: 1,
      type: "limit" as OrderType,
      side: "buy" as OrderSide,
      status: "open" as OrderStatus,
      price: 30500.50,
      quantity: 0.15,
      filledQuantity: 0,
      totalCost: 4575.08,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      userId: userId,
      pairId: 2,
      type: "market" as OrderType,
      side: "sell" as OrderSide,
      status: "filled" as OrderStatus,
      price: 1821.25,
      quantity: 2.5,
      filledQuantity: 2.5,
      totalCost: 4553.13,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      userId: userId,
      pairId: 1,
      type: "stop_limit" as OrderType,
      side: "sell" as OrderSide,
      status: "open" as OrderStatus,
      price: 29000,
      stopPrice: 29500,
      quantity: 0.1,
      filledQuantity: 0,
      totalCost: 2900,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

const generateOrderBook = (pairId: number) => {
  // Generate realistic bids and asks with incremental prices
  const basePrices: Record<number, number> = {
    1: 30000, // BTC-USDT
    2: 1800,  // ETH-USDT
    3: 0.5,   // XRP-USDT
  };
  
  const basePrice = basePrices[pairId] || 100;
  const bids = [];
  const asks = [];
  
  // Generate 10 levels of bids (buy orders)
  let cumulative = 0;
  for (let i = 0; i < 10; i++) {
    const price = basePrice * (1 - (i * 0.001)); // Each bid is 0.1% less than the previous
    const quantity = Math.random() * 2 + 0.1; // Random quantity between 0.1 and 2.1
    cumulative += quantity;
    bids.push({
      price,
      quantity,
      total: cumulative,
    });
  }
  
  // Generate 10 levels of asks (sell orders)
  cumulative = 0;
  for (let i = 0; i < 10; i++) {
    const price = basePrice * (1 + (i * 0.001)); // Each ask is 0.1% more than the previous
    const quantity = Math.random() * 2 + 0.1; // Random quantity between 0.1 and 2.1
    cumulative += quantity;
    asks.push({
      price,
      quantity,
      total: cumulative,
    });
  }
  
  // Sort bids descending and asks ascending
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);
  
  return { bids, asks };
};

const generateMarketDepth = (pairId: number) => {
  const { bids, asks } = generateOrderBook(pairId);
  
  const bidEntries = bids.map((bid, index) => ({
    id: index + 1,
    pairId: pairId,
    side: "buy" as OrderSide,
    price: bid.price,
    quantity: bid.quantity,
    timestamp: new Date(),
  }));
  
  const askEntries = asks.map((ask, index) => ({
    id: index + 101, // Offset to avoid ID collision
    pairId: pairId,
    side: "sell" as OrderSide,
    price: ask.price,
    quantity: ask.quantity,
    timestamp: new Date(),
  }));
  
  return [...bidEntries, ...askEntries];
};

const generateMockAlerts = (userId: number) => {
  return [
    {
      id: 1,
      userId,
      pairId: 1,
      type: "price",
      triggerValue: 32000,
      comparison: "above",
      isActive: true,
      message: "BTC reached 32k!",
      notifyVia: ["app", "email"],
      cooldownMinutes: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      userId,
      pairId: 2,
      type: "volume",
      triggerValue: 10000000,
      comparison: "above",
      isActive: true,
      message: "High ETH volume detected",
      notifyVia: ["app"],
      cooldownMinutes: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      userId,
      pairId: 1,
      type: "price",
      triggerValue: 25000,
      comparison: "below",
      isActive: false,
      message: "BTC dipped below 25k!",
      notifyVia: ["app", "email", "sms"],
      cooldownMinutes: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

export async function registerTradingRoutes(app: any) {
  // Get all trading pairs
  app.get("/api/trading/pairs", async (req: Request, res: Response) => {
    try {
      // Uncomment when database is ready
      // const pairs = await db.select().from(tradingPairs);
      
      // For now, use mock data
      const pairs = generateMockPairs();
      
      res.json(pairs);
    } catch (error) {
      console.error("Error fetching trading pairs:", error);
      res.status(500).json({ error: "Failed to fetch trading pairs" });
    }
  });

  // Get specific trading pair
  app.get("/api/trading/pairs/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Uncomment when database is ready
      // const [pair] = await db.select().from(tradingPairs).where(eq(tradingPairs.id, parseInt(id)));
      
      // For now, use mock data
      const pairs = generateMockPairs();
      const pair = pairs.find(p => p.id === parseInt(id));
      
      if (!pair) {
        return res.status(404).json({ error: "Trading pair not found" });
      }
      
      res.json(pair);
    } catch (error) {
      console.error("Error fetching trading pair:", error);
      res.status(500).json({ error: "Failed to fetch trading pair" });
    }
  });

  // Get orders for user
  app.get("/api/trading/orders", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      
      // Uncomment when database is ready
      // const orders = await db
      //   .select()
      //   .from(tradingOrders)
      //   .where(eq(tradingOrders.userId, userId))
      //   .orderBy(desc(tradingOrders.createdAt));
      
      // For now, use mock data
      const orders = generateMockOrders(userId);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Create a new order
  app.post("/api/trading/orders", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { 
        pairId, 
        side, 
        type, 
        price, 
        stopPrice, 
        quantity, 
        leverage = 1,
        takeProfitPrice,
        stopLossPrice,
        expiresAt,
        iceberg,
        icebergQty
      } = req.body;
      
      // Basic validation
      if (!pairId || !side || !type || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Specific validation based on order type
      if (type === "limit" && !price) {
        return res.status(400).json({ error: "Price is required for limit orders" });
      }
      
      if ((type === "stop" || type === "stop_limit") && !stopPrice) {
        return res.status(400).json({ error: "Stop price is required for stop orders" });
      }

      // Calculate total cost
      const totalCost = price ? price * quantity : undefined;
      
      // Generate client order ID
      const clientOrderId = uuidv4();
      
      // Uncomment when database is ready
      // const [order] = await db
      //   .insert(tradingOrders)
      //   .values({
      //     userId,
      //     pairId,
      //     side,
      //     type,
      //     price,
      //     stopPrice,
      //     quantity,
      //     filledQuantity: 0,
      //     totalCost,
      //     status: 'open',
      //     clientOrderId,
      //     expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      //     notes: iceberg ? `Iceberg order, visible qty: ${icebergQty}` : undefined,
      //   })
      //   .returning();
      
      // For now, return mock response
      const order = {
        id: Math.floor(Math.random() * 1000) + 1,
        userId,
        pairId,
        side,
        type,
        price,
        stopPrice,
        quantity,
        filledQuantity: 0,
        totalCost,
        status: 'open',
        clientOrderId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        notes: iceberg ? `Iceberg order, visible qty: ${icebergQty}` : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Cancel an order
  app.delete("/api/trading/orders/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { id } = req.params;
      
      // Uncomment when database is ready
      // const [order] = await db
      //   .select()
      //   .from(tradingOrders)
      //   .where(and(
      //     eq(tradingOrders.id, parseInt(id)),
      //     eq(tradingOrders.userId, userId)
      //   ));
      
      // if (!order) {
      //   return res.status(404).json({ error: "Order not found" });
      // }
      
      // if (order.status !== 'open' && order.status !== 'partial') {
      //   return res.status(400).json({ error: "Cannot cancel a completed or cancelled order" });
      // }
      
      // await db
      //   .update(tradingOrders)
      //   .set({ status: 'cancelled', updatedAt: new Date() })
      //   .where(eq(tradingOrders.id, parseInt(id)));
      
      // Return success response
      res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  // Get order book for a trading pair
  app.get("/api/trading/orderbook/:pairId", async (req: Request, res: Response) => {
    try {
      const { pairId } = req.params;
      
      // For now, generate mock order book
      const orderBook = generateOrderBook(parseInt(pairId));
      
      res.json(orderBook);
    } catch (error) {
      console.error("Error fetching order book:", error);
      res.status(500).json({ error: "Failed to fetch order book" });
    }
  });

  // Get market depth for a trading pair
  app.get("/api/trading/depth/:pairId", async (req: Request, res: Response) => {
    try {
      const { pairId } = req.params;
      
      // Uncomment when database is ready
      // const depth = await db
      //   .select()
      //   .from(marketDepth)
      //   .where(eq(marketDepth.pairId, parseInt(pairId)));
      
      // For now, generate mock market depth
      const depth = generateMarketDepth(parseInt(pairId));
      
      res.json(depth);
    } catch (error) {
      console.error("Error fetching market depth:", error);
      res.status(500).json({ error: "Failed to fetch market depth" });
    }
  });

  // Get trading alerts for user
  app.get("/api/trading/alerts", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      
      // Uncomment when database is ready
      // const alerts = await db
      //   .select()
      //   .from(tradingAlerts)
      //   .where(eq(tradingAlerts.userId, userId))
      //   .orderBy(desc(tradingAlerts.createdAt));
      
      // For now, use mock data
      const alerts = generateMockAlerts(userId);
      
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Create a new alert
  app.post("/api/trading/alerts", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { 
        pairId, 
        type, 
        triggerValue, 
        comparison, 
        message, 
        notifyVia, 
        cooldownMinutes 
      } = req.body;
      
      // Basic validation
      if (!pairId || !type || !triggerValue || !comparison || !notifyVia) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Uncomment when database is ready
      // const [alert] = await db
      //   .insert(tradingAlerts)
      //   .values({
      //     userId,
      //     pairId,
      //     type,
      //     triggerValue,
      //     comparison,
      //     message,
      //     notifyVia,
      //     cooldownMinutes: cooldownMinutes || 60,
      //     isActive: true,
      //   })
      //   .returning();
      
      // For now, return mock response
      const alert = {
        id: Math.floor(Math.random() * 1000) + 1,
        userId,
        pairId,
        type,
        triggerValue,
        comparison,
        message,
        notifyVia,
        cooldownMinutes: cooldownMinutes || 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  // Update an alert (toggle active status)
  app.patch("/api/trading/alerts/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { id } = req.params;
      const { isActive } = req.body;
      
      // Uncomment when database is ready
      // const [alert] = await db
      //   .select()
      //   .from(tradingAlerts)
      //   .where(and(
      //     eq(tradingAlerts.id, parseInt(id)),
      //     eq(tradingAlerts.userId, userId)
      //   ));
      
      // if (!alert) {
      //   return res.status(404).json({ error: "Alert not found" });
      // }
      
      // await db
      //   .update(tradingAlerts)
      //   .set({ isActive, updatedAt: new Date() })
      //   .where(eq(tradingAlerts.id, parseInt(id)));
      
      // Return success response
      res.json({ success: true, message: `Alert ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // Delete an alert
  app.delete("/api/trading/alerts/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { id } = req.params;
      
      // Uncomment when database is ready
      // const [alert] = await db
      //   .select()
      //   .from(tradingAlerts)
      //   .where(and(
      //     eq(tradingAlerts.id, parseInt(id)),
      //     eq(tradingAlerts.userId, userId)
      //   ));
      
      // if (!alert) {
      //   return res.status(404).json({ error: "Alert not found" });
      // }
      
      // await db
      //   .delete(tradingAlerts)
      //   .where(eq(tradingAlerts.id, parseInt(id)));
      
      // Return success response
      res.json({ success: true, message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // Get trading positions for user
  app.get("/api/trading/positions", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      
      // Uncomment when database is ready
      // const positions = await db
      //   .select()
      //   .from(tradingPositions)
      //   .where(eq(tradingPositions.userId, userId));
      
      // For now, return mock response
      const positions = [
        {
          id: 1,
          userId,
          pairId: 1,
          side: "buy",
          entryPrice: 29850.75,
          quantity: 0.2,
          leverage: 2,
          liquidationPrice: 14925.38,
          unrealizedPnl: 150.25,
          realizedPnl: 0,
          margin: 2985.08,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId,
          pairId: 2,
          side: "sell",
          entryPrice: 1920.50,
          quantity: 5,
          leverage: 3,
          liquidationPrice: 2560.67,
          unrealizedPnl: -250.75,
          realizedPnl: 0,
          margin: 3201.67,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          updatedAt: new Date(),
        },
      ];
      
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });
}