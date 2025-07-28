import { Request, Response } from 'express';
import { db } from '../db';
import { rfqs, users } from '../models/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Get all RFQs
 */
export async function getAllRfqs(req: Request, res: Response) {
  try {
    const allRfqs = await db.query.rfqs.findMany({
      orderBy: desc(rfqs.createdAt),
      with: {
        user: true
      }
    });
    
    res.json(allRfqs);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
}

/**
 * Get RFQs for the authenticated user
 */
export async function getUserRfqs(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRfqs = await db.query.rfqs.findMany({
      where: eq(rfqs.userId, req.user.id),
      orderBy: desc(rfqs.createdAt)
    });
    
    res.json(userRfqs);
  } catch (error) {
    console.error('Error fetching user RFQs:', error);
    res.status(500).json({ error: 'Failed to fetch user RFQs' });
  }
}

/**
 * Get a single RFQ by ID
 */
export async function getRfqById(req: Request, res: Response) {
  try {
    const rfqId = parseInt(req.params.id);
    if (isNaN(rfqId)) {
      return res.status(400).json({ error: 'Invalid RFQ ID' });
    }
    
    const rfq = await db.query.rfqs.findFirst({
      where: eq(rfqs.id, rfqId),
      with: {
        user: true
      }
    });
    
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    
    res.json(rfq);
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
}

/**
 * Create a new RFQ
 */
export async function createRfq(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const rfqData = req.body;
    
    // Validate required fields
    if (!rfqData.title || !rfqData.description) {
      return res.status(400).json({ error: 'Missing required RFQ fields' });
    }
    
    // Create the reference number
    const now = new Date();
    const referenceNumber = `RFQ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    // Create the RFQ in database
    const [newRfq] = await db.insert(rfqs).values({
      userId: req.user.id,
      title: rfqData.title,
      description: rfqData.description,
      category: rfqData.category || 'Other',
      quantity: rfqData.quantity || '1',
      deadline: new Date(rfqData.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000),
      specifications: rfqData.specifications || {},
      referenceNumber,
      rfqType: 'text',
      status: 'open'
    }).returning();
    
    res.status(201).json(newRfq);
  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ error: 'Failed to create RFQ', details: (error as Error).message });
  }
}