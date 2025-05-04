import { Request, Response } from "express";
import { rfqCategorizationService } from "../services/rfq-categorization";
import { storage } from "../storage";
import { log } from "../utils";

export class RfqCategorizationController {
  /**
   * Auto-categorize an RFQ
   * @param req Request with RFQ ID
   * @param res Response with categorization results
   */
  autoCategorizeRfq = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rfqId } = req.params;
      
      if (!rfqId || isNaN(parseInt(rfqId))) {
        res.status(400).json({ error: "Valid RFQ ID is required" });
        return;
      }
      
      // Get the RFQ
      const rfq = await storage.getRfq(parseInt(rfqId));
      
      if (!rfq) {
        res.status(404).json({ error: "RFQ not found" });
        return;
      }
      
      // Categorize the RFQ
      const categorization = await rfqCategorizationService.categorizeRfq(rfq);
      
      // Return the categorization results
      res.status(200).json(categorization);
    } catch (error) {
      log(`Error in auto-categorize RFQ: ${error.message}`, "rfq-categorization-controller");
      res.status(500).json({ 
        error: "Failed to categorize RFQ", 
        message: error.message 
      });
    }
  };
  
  /**
   * Update RFQ categorization
   * @param req Request with RFQ ID, category ID, and industry ID
   * @param res Response with updated RFQ
   */
  updateRfqCategorization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rfqId } = req.params;
      const { categoryId, industryId } = req.body;
      
      if (!rfqId || isNaN(parseInt(rfqId))) {
        res.status(400).json({ error: "Valid RFQ ID is required" });
        return;
      }
      
      if (!categoryId || isNaN(parseInt(categoryId))) {
        res.status(400).json({ error: "Valid category ID is required" });
        return;
      }
      
      if (!industryId || isNaN(parseInt(industryId))) {
        res.status(400).json({ error: "Valid industry ID is required" });
        return;
      }
      
      // Update the RFQ categorization
      const updatedRfq = await rfqCategorizationService.updateRfqCategorization(
        parseInt(rfqId),
        parseInt(categoryId),
        parseInt(industryId)
      );
      
      // Return the updated RFQ
      res.status(200).json(updatedRfq);
    } catch (error) {
      log(`Error in update RFQ categorization: ${error.message}`, "rfq-categorization-controller");
      res.status(500).json({ 
        error: "Failed to update RFQ categorization", 
        message: error.message 
      });
    }
  };
  
  /**
   * Batch categorize multiple RFQs
   * @param req Request with array of RFQ IDs
   * @param res Response with categorization results
   */
  batchCategorizeRfqs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rfqIds } = req.body;
      
      if (!rfqIds || !Array.isArray(rfqIds) || rfqIds.length === 0) {
        res.status(400).json({ error: "Valid array of RFQ IDs is required" });
        return;
      }
      
      // Process each RFQ ID
      const results = [];
      for (const rfqId of rfqIds) {
        try {
          // Get the RFQ
          const rfq = await storage.getRfq(parseInt(rfqId));
          
          if (!rfq) {
            results.push({
              rfqId,
              success: false,
              error: "RFQ not found"
            });
            continue;
          }
          
          // Categorize the RFQ
          const categorization = await rfqCategorizationService.categorizeRfq(rfq);
          
          // Update the RFQ with the categorization
          await rfqCategorizationService.updateRfqCategorization(
            rfq.id,
            categorization.categoryId,
            categorization.industryId
          );
          
          // Add result
          results.push({
            rfqId,
            success: true,
            categorization
          });
        } catch (error) {
          results.push({
            rfqId,
            success: false,
            error: error.message
          });
        }
      }
      
      // Return the results
      res.status(200).json({
        total: rfqIds.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      });
    } catch (error) {
      log(`Error in batch categorize RFQs: ${error.message}`, "rfq-categorization-controller");
      res.status(500).json({ 
        error: "Failed to batch categorize RFQs", 
        message: error.message 
      });
    }
  };
}

export const rfqCategorizationController = new RfqCategorizationController();