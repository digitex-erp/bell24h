import type { Express } from "express";
import * as controller from "./industry-trends.controller";
import { isAuthenticated } from "../utils";

/**
 * Register Industry Trends routes
 */
export function registerIndustryTrendsRoutes(app: Express) {
  // Generate one-click industry trend snapshot
  app.post("/api/industry-trends/generate-snapshot", 
    (req, res, next) => {
      controller.generateOneClickSnapshot(req, res);
    }
  );
  
  // Get featured industries for one-click generator
  app.get("/api/industry-trends/featured-industries", 
    (req, res, next) => {
      controller.getFeaturedIndustries(req, res);
    }
  );
  
  // Get all available industries
  app.get("/api/industry-trends/industries", 
    (req, res, next) => {
      controller.getAllIndustries(req, res);
    }
  );
  
  // Subscribe to trend updates
  app.post("/api/industry-trends/subscribe", 
    (req, res, next) => {
      controller.subscribeTrendUpdates(req, res);
    }
  );
  
  // Unsubscribe from trend updates
  app.post("/api/industry-trends/unsubscribe/:subscriptionId", 
    (req, res, next) => {
      controller.unsubscribeTrendUpdates(req, res);
    }
  );
  
  // Get user's recent snapshots (authenticated route)
  app.get("/api/industry-trends/user-snapshots", 
    (req, res, next) => {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ error: "Authentication required" });
      }
      controller.getUserSnapshots(req, res);
    }
  );
  
  // Get snapshot by ID
  app.get("/api/industry-trends/snapshot/:id", 
    (req, res, next) => {
      controller.getSnapshotById(req, res);
    }
  );
  
  // Share snapshot by making it public
  app.post("/api/industry-trends/share-snapshot/:id", 
    (req, res, next) => {
      controller.shareSnapshot(req, res);
    }
  );
  
  // Initialize industry trends data
  app.post("/api/industry-trends/initialize", 
    (req, res, next) => {
      controller.initializeTrendsData(req, res);
    }
  );
}