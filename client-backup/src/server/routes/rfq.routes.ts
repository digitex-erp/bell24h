import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validateRequest';
import { log } from '../utils';
import { authenticate, requireAuth, requireBuyer, requireSeller, requireAdmin } from '../../middleware/auth';

import { createRfqSchema, updateRfqSchema } from '../api/rfq/rfq.schema';
import { db } from '../db'; 
import { rfqs, Rfq } from '../models/schema'; 
import { eq } from 'drizzle-orm'; 
import asyncHandler from '../utils/asyncHandler'; 

import { ModelMonitor } from '../../models/ai-explainer';

export default function rfqRoutes(modelMonitor: ModelMonitor) {
  const router = Router();

  /**
   * Create RFQ
   * POST /api/rfqs
   */
  router.post('/', requireAuth, requireBuyer, validate(createRfqSchema), asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found' });
      }

      const { rfqTitle, rfqText, category, budget, deadline, quantity } = req.body;

      const [newRfq] = await db.insert(rfqs).values({
        userId: userId,
        title: rfqTitle,
        description: rfqText,
        category,
        budget: budget ? String(budget) : null,
        deadline: deadline || null,
        quantity: quantity || null,
        status: 'open',
      }).returning();

      // AI Matching Logic
      const explainer = modelMonitor.getExplainer();
      let recommendedSellers: { id: number; score: number; }[] = [];

      if (explainer) {
        const inputFeatures = [Math.random(), parseFloat(budget || '0'), Math.random()];
        const explanation = await explainer.explain(inputFeatures);

        recommendedSellers = [
          { id: 101, score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)) },
          { id: 102, score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)) },
          { id: 103, score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)) },
        ].sort((a, b) => b.score - a.score);

        log(`AI matched sellers for RFQ ${newRfq.id}: ${JSON.stringify(recommendedSellers)}`, 'info');

        await db.update(rfqs).set({ recommendedSellers }).where(eq(rfqs.id, newRfq.id));
      }

      log(`RFQ created: ${newRfq.id} by user ${userId}`, 'info');
      res.status(201).json({ message: 'RFQ created successfully', rfq: { ...newRfq, recommendedSellers } });
    } catch (error) {
      log(`RFQ creation error: ${error}`, 'error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }));

  /**
   * Get All RFQs (for the logged-in Buyer)
   * GET /api/rfqs
   */
  router.get('/', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    try {
      let allRfqs: Rfq[];

      if (currentUser.role === 'buyer') {
        allRfqs = await db.select().from(rfqs).where(eq(rfqs.userId, currentUser.id)) as Rfq[];
        log(`Fetched RFQs for current buyer user ${currentUser.id}`, 'info');
      } else if (currentUser.role === 'seller') {
        allRfqs = await db.select().from(rfqs).where(eq(rfqs.status, 'open')) as Rfq[];
        log(`Fetched all open RFQs for seller ${currentUser.id}`, 'info');
      } else if (currentUser.role === 'admin') {
        allRfqs = await db.select().from(rfqs) as Rfq[];
        log('Fetched all RFQs for admin', 'info');
      } else {
        return res.status(403).json({ error: 'Access denied: Insufficient role to view all RFQs' });
      }

      res.status(200).json({ message: 'RFQs fetched successfully', rfqs: allRfqs });
    } catch (error) {
      log(`Get all RFQs error: ${error}`, 'error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }));

  /**
   * Get a Specific RFQ by ID
   * GET /api/rfqs/:rfqId
   */
  router.get('/:rfqId', requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    try {
      const { rfqId } = req.params;
      const id = Number(rfqId);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid RFQ ID' });
      }

      const rfq = await db.select().from(rfqs).where(eq(rfqs.id, id));

      if (!rfq || rfq.length === 0) {
        return res.status(404).json({ message: `RFQ with ID ${id} not found` });
      }

      if (currentUser.role === 'buyer' && rfq[0].userId !== currentUser.id) {
        return res.status(403).json({ error: 'Access denied: You can only view your own RFQs' });
      }

      if (currentUser.role !== 'seller' && currentUser.role !== 'admin' && rfq[0].userId !== currentUser.id) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions to view this RFQ' });
      }

      log(`Fetched RFQ with ID: ${id}`, 'info');
      res.status(200).json({ message: 'RFQ fetched successfully', rfq: rfq[0] as Rfq });
    } catch (error) {
      log(`Get RFQ by ID error: ${error}`, 'error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }));

  /**
   * Update an RFQ
   * PUT /api/rfqs/:rfqId
   */
  router.put('/:rfqId', requireAuth, requireBuyer, validate(updateRfqSchema), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    try {
      const { rfqId } = req.params;
      const id = Number(rfqId);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid RFQ ID' });
      }

      const existingRfq = await db.select().from(rfqs).where(eq(rfqs.id, id));

      if (!existingRfq || existingRfq.length === 0) {
        return res.status(404).json({ message: `RFQ with ID ${id} not found` });
      }

      if (existingRfq[0].userId !== currentUser.id && currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: You can only update your own RFQs' });
      }

      const { rfqTitle, rfqText, category, budget, deadline, quantity, status } = req.body;
    res.status(500).json({ error: 'Internal server error' });
  }
}))
  try {
    const { id } = req.params;
    const rfqId = Number(id);

    if (isNaN(rfqId)) {
      return res.status(400).json({ error: 'Invalid RFQ ID' });
    }

    const { title, description, category, budget, deadline, status } = req.body;

    const [updatedRfq] = await db.update(rfqs).set({
      title,
      description,
      category,
      budget: budget ? String(budget) : null,
      deadline: deadline || null,
      status,
      updatedAt: new Date(),
    }).where(eq(rfqs.id, rfqId)).returning();

    if (!updatedRfq) {
      return res.status(404).json({ message: `RFQ with ID ${id} not found` });
    }

    log(`RFQ with ID ${id} updated`, 'info');
    res.status(200).json({ message: 'RFQ updated successfully', rfq: updatedRfq as Rfq });
  } catch (error) {
    log(`RFQ update error: ${error}`, 'error');
    res.status(500).json({ error: 'Internal server error' });
  }
}))

/**
 * Delete RFQ
 * DELETE /api/rfqs/:id
 */
router.delete('/:id', requireAuth, requireBuyer, asyncHandler(async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  try {
    const { id } = req.params;
    const rfqId = Number(id);

    if (isNaN(rfqId)) {
      return res.status(400).json({ error: 'Invalid RFQ ID' });
    }

    const existingRfq = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));

    if (!existingRfq || existingRfq.length === 0) {
      return res.status(404).json({ message: `RFQ with ID ${id} not found` });
    }

    // Ensure the current user is the owner of the RFQ or an admin
    if (existingRfq[0].userId !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You can only delete your own RFQs' });
    }

    await db.delete(rfqs).where(eq(rfqs.id, rfqId));

    log(`RFQ with ID ${id} deleted`, 'info');
    res.status(200).json({ message: 'RFQ deleted successfully' });
  } catch (error) {
    log(`Delete RFQ error: ${error}`, 'error');
    res.status(500).json({ error: 'Internal server error' });
  }
}))
  try {
    const { id } = req.params;
    const rfqId = Number(id);

    if (isNaN(rfqId)) {
      return res.status(400).json({ error: 'Invalid RFQ ID' });
    }

    const [deletedRfq] = await db.delete(rfqs).where(eq(rfqs.id, rfqId)).returning();

    if (!deletedRfq) {
      return res.status(404).json({ message: `RFQ with ID ${id} not found` });
    }

    log(`RFQ with ID ${id} deleted`, 'info');
    res.status(200).json({ message: 'RFQ deleted successfully', rfq: deletedRfq as Rfq });
  } catch (error) {
    log(`RFQ deletion error: ${error}`, 'error');
    res.status(500).json({ error: 'Internal server error' });
  }
}))

export default router;
