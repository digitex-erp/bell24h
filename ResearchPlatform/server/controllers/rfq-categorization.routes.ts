import type { Express } from "express";
import { rfqCategorizationController } from "./rfq-categorization.controller";

export function registerRfqCategorizationRoutes(app: Express): void {
  // Auto-categorize a single RFQ
  app.get('/api/rfq-categorization/:rfqId', rfqCategorizationController.autoCategorizeRfq);
  
  // Update RFQ categorization
  app.put('/api/rfq-categorization/:rfqId', rfqCategorizationController.updateRfqCategorization);
  
  // Batch categorize multiple RFQs
  app.post('/api/rfq-categorization/batch', rfqCategorizationController.batchCategorizeRfqs);
}