import express from 'express';
import { db } from '../server';
import { contracts, bids, rfqs } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all contracts
router.get('/contracts', async (req, res) => {
  try {
    const allContracts = await db.select().from(contracts);
    res.json(allContracts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching contracts' });
  }
});

// Get single contract
router.get('/contracts/:id', async (req, res) => {
  try {
    const contract = await db.select()
      .from(contracts)
      .where(eq(contracts.id, parseInt(req.params.id)))
      .limit(1);
    
    if (!contract.length) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching contract' });
  }
});

// Create new contract from accepted bid
router.post('/bids/:bidId/contract', async (req, res) => {
  try {
    const { terms } = req.body;
    const bidId = parseInt(req.params.bidId);
    
    // Get bid details
    const bid = await db.select()
      .from(bids)
      .where(eq(bids.id, bidId))
      .limit(1);
    
    if (!bid.length) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    // Get RFQ details
    const rfq = await db.select()
      .from(rfqs)
      .where(eq(rfqs.id, bid[0].rfqId))
      .limit(1);
    
    if (!rfq.length) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    // Create contract
    const newContract = await db.insert(contracts).values({
      rfqId: rfq[0].id,
      bidId: bid[0].id,
      buyerId: rfq[0].buyerId,
      supplierId: bid[0].supplierId,
      terms,
      status: 'draft'
    }).returning();
    
    // Update bid status
    await db.update(bids)
      .set({ status: 'accepted' })
      .where(eq(bids.id, bidId));
    
    // Update RFQ status
    await db.update(rfqs)
      .set({ status: 'contracted' })
      .where(eq(rfqs.id, rfq[0].id));
    
    res.json(newContract[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating contract' });
  }
});

// Update contract
router.put('/contracts/:id', async (req, res) => {
  try {
    const { terms, status } = req.body;
    const updatedContract = await db.update(contracts)
      .set({
        terms,
        status,
        updatedAt: new Date()
      })
      .where(eq(contracts.id, parseInt(req.params.id)))
      .returning();
    
    if (!updatedContract.length) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(updatedContract[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating contract' });
  }
});

export default router;
