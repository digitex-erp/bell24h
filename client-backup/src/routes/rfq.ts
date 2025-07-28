import express from 'express';
import { db } from '../server';
import { rfqs, bids } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all RFQs
router.get('/rfqs', async (req, res) => {
  try {
    const allRfqs = await db.select().from(rfqs);
    res.json(allRfqs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching RFQs' });
  }
});

// Get single RFQ with bids
router.get('/rfqs/:id', async (req, res) => {
  try {
    const rfq = await db.select().from(rfqs).where(eq(rfqs.id, parseInt(req.params.id))).limit(1);
    if (!rfq.length) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    const rfqBids = await db.select().from(bids).where(eq(bids.rfqId, rfq[0].id));
    res.json({ ...rfq[0], bids: rfqBids });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching RFQ' });
  }
});

// Create new RFQ
router.post('/rfqs', async (req, res) => {
  try {
    const { title, description, category, budget, deadline } = req.body;
    const newRfq = await db.insert(rfqs).values({
      buyerId: (req.user as any).id,
      title,
      description,
      category,
      budget,
      deadline: new Date(deadline),
      status: 'open'
    }).returning();
    
    res.json(newRfq[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating RFQ' });
  }
});

// Update RFQ
router.put('/rfqs/:id', async (req, res) => {
  try {
    const { title, description, category, budget, deadline, status } = req.body;
    const updatedRfq = await db.update(rfqs)
      .set({
        title,
        description,
        category,
        budget,
        deadline: new Date(deadline),
        status,
        updatedAt: new Date()
      })
      .where(eq(rfqs.id, parseInt(req.params.id)))
      .returning();
    
    if (!updatedRfq.length) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    res.json(updatedRfq[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating RFQ' });
  }
});

// Delete RFQ
router.delete('/rfqs/:id', async (req, res) => {
  try {
    const deletedRfq = await db.delete(rfqs)
      .where(eq(rfqs.id, parseInt(req.params.id)))
      .returning();
    
    if (!deletedRfq.length) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    res.json({ message: 'RFQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting RFQ' });
  }
});

export default router;
