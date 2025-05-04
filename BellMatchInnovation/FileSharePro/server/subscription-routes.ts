
import type { Express } from "express";
import { db } from "./db";
import { subscriptionTierEnum, subscriptionPlanFeatures } from "@shared/schema";
import { z } from "zod";

const subscriptionSchema = z.object({
  tier: subscriptionTierEnum,
});

export function createSubscriptionRoutes(app: Express) {
  // Get current subscription
  app.get("/api/subscriptions/current", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const subscription = await db
        .select()
        .from("subscriptions")
        .where("userId", "=", req.user.id)
        .first();

      const tier = subscription?.tier || "free";
      const limits = subscriptionPlanFeatures[tier];
      
      res.json({
        tier,
        limits,
        ...subscription
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Subscribe to plan
  app.post("/api/subscriptions", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      
      const { tier } = subscriptionSchema.parse(req.body);
      const limits = subscriptionPlanFeatures[tier];
      
      // Check if user has existing subscription
      const existingSubscription = await db
        .select()
        .from("subscriptions")
        .where("userId", "=", req.user.id)
        .first();

      // Check product count before downgrading  
      if (tier !== 'unlimited') {
        const productCount = await db
          .select({ count: db.fn.count() })
          .from("products")
          .where("sellerId", "=", req.user.id)
          .first();

        if (productCount && productCount.count > limits.productLimit) {
          return res.status(400).json({ 
            message: `Cannot downgrade: You have ${productCount.count} products but ${tier} tier only allows ${limits.productLimit}`
          });
        }
      }
      
      const subscription = await db
        .insert("subscriptions")
        .values({
          userId: req.user.id,
          tier,
          startDate: new Date(),
          isActive: true,
          productLimit: limits.productLimit,
        })
        .onConflict("userId")
        .merge();
      
      res.json({
        tier,
        limits,
        ...subscription
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });
}
