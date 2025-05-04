import { Router } from 'express';
import { db } from '../db';
import { rfqs, suppliers, rfqSuppliers } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { enhancedSupplierMatching, getSupplierMatchingHistory } from '../services/ml-matching';

const router = Router();

/**
 * Get supplier recommendations for an RFQ with detailed explanation
 */
router.get('/api/rfq/:rfqId/supplier-recommendations', async (req, res) => {
  try {
    const rfqId = parseInt(req.params.rfqId);
    
    if (isNaN(rfqId)) {
      return res.status(400).json({ error: 'Invalid RFQ ID' });
    }
    
    // Get RFQ details
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));
    
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    // Get potential suppliers for this industry
    const potentialSuppliers = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.industry, rfq.industry));
    
    if (potentialSuppliers.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }
    
    // Use ML matching service to get enhanced recommendations with explanations
    const supplierRecommendations = await enhancedSupplierMatching(rfq, potentialSuppliers);
    
    // Return to client
    res.status(200).json({
      rfq,
      recommendations: supplierRecommendations
    });
  } catch (error) {
    console.error('Error getting supplier recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get additional context/history for a specific supplier-RFQ match
 */
router.get('/api/rfq/:rfqId/supplier/:supplierId/context', async (req, res) => {
  try {
    const rfqId = parseInt(req.params.rfqId);
    const supplierId = parseInt(req.params.supplierId);
    
    if (isNaN(rfqId) || isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid RFQ ID or Supplier ID' });
    }
    
    // Get the matching history and context for this supplier-RFQ pair
    const matchingContext = await getSupplierMatchingHistory(rfqId, supplierId);
    
    if (!matchingContext) {
      return res.status(404).json({ error: 'Matching context not found' });
    }
    
    // Return to client
    res.status(200).json(matchingContext);
  } catch (error) {
    console.error('Error getting supplier-RFQ context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;