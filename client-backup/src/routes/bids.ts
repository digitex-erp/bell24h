import express from 'express';
import { db } from '../server';
import { bids, rfqs } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all bids for an RFQ
router.get('/rfqs/:rfqId/bids', async (req, res) => {
  try {
    const rfqBids = await db.select()
      .from(bids)
      .where(eq(bids.rfqId, parseInt(req.params.rfqId)));
    res.json(rfqBids);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bids' });
  }
});

// Get single bid
router.get('/bids/:id', async (req, res) => {
  try {
    const bid = await db.select()
      .from(bids)
      .where(eq(bids.id, parseInt(req.params.id)))
      .limit(1);
    
    if (!bid.length) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    res.json(bid[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bid' });
  }
});

// Create new bid
router.post('/rfqs/:rfqId/bids', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const rfqId = parseInt(req.params.rfqId);
    
    // Check if RFQ exists and is open
    const rfq = await db.select()
      .from(rfqs)
      .where(eq(rfqs.id, rfqId))
      .limit(1);
    
    if (!rfq.length || rfq[0].status !== 'open') {
      return res.status(400).json({ error: 'RFQ not found or not open for bids' });
    }
    
    const newBid = await db.insert(bids).values({
      rfqId,
      supplierId: (req.user as any).id,
      amount,
      description,
      status: 'pending'
    }).returning();
    
    res.json(newBid[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating bid' });
  }
});

// Update bid
router.put('/bids/:id', async (req, res) => {
  try {
    const { amount, description, status } = req.body;
    const updatedBid = await db.update(bids)
      .set({
        amount,
        description,
        status,
        updatedAt: new Date()
      })
      .where(eq(bids.id, parseInt(req.params.id)))
      .returning();
    
    if (!updatedBid.length) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    res.json(updatedBid[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating bid' });
  }
});

// Delete bid
router.delete('/bids/:id', async (req, res) => {
  try {
    const deletedBid = await db.delete(bids)
      .where(eq(bids.id, parseInt(req.params.id)))
      .returning();
    
    if (!deletedBid.length) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    res.json({ message: 'Bid deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting bid' });
  }
});

export default router;
