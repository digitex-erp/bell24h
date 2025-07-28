import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notification.js';
import { AuthenticatedRequest, ExtendedUser } from '../types/express.js';

// Define enums that should come from Prisma client
enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

enum RFQStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

interface Bid {
  id: string;
  price: number;
  deliveryTime: number;
  status: string;
  rfqId: string;
  companyId: string;
  userId: string;
}

const prisma = new PrismaClient();

export const createRFQ = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({ error: 'User is not associated with a company' });
    }

    const data = req.body;
    const rfq = await prisma.rFQ.create({
      data: {
        ...data,
        buyerId: userId,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create notifications for all suppliers
    await NotificationService.createRFQNotification(rfq, 'CREATE');

    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
};

export const getRFQs = async (req: AuthenticatedRequest & { query: { page?: string; limit?: string; status?: string } }, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const { status } = req.query;
    
    if (!req.user?.companyId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const rfqs = await prisma.rFQ.findMany({
      where: {
        companyId: req.user.companyId,
        ...(status ? { status } : {}),
      },
      include: {
        company: true,
        bids: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    res.json(rfqs);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

export const createBid = async (req: AuthenticatedRequest & { body: { rfqId: string; price: number; deliveryTime: string; description: string } }, res: Response) => {
  try {
    const { rfqId, price, deliveryTime, description } = req.body;

    if (!req.user?.id || !req.user.companyId) {
      return res.status(401).json({ error: 'User not authenticated or missing company information' });
    }

    // Verify the RFQ exists and is open
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { 
        company: true,
        bids: {
          where: { companyId: req.user.companyId },
          take: 1
        }
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    // Check if user is trying to bid on their own RFQ
    if (rfq.companyId === req.user.companyId) {
      return res.status(400).json({ error: 'Cannot bid on your own RFQ' });
    }

    // Check if RFQ is open for bidding
    if (rfq.status !== 'OPEN') {
      return res.status(400).json({ error: 'RFQ is not open for bidding' });
    }

    // Check if user already has an existing bid
    if (rfq.bids && rfq.bids.length > 0) {
      return res.status(400).json({ error: 'You have already placed a bid on this RFQ' });
    }

    // Create the new bid
    const bid = await prisma.bid.create({
      data: {
        price,
        deliveryTime: new Date(deliveryTime),
        description,
        status: 'PENDING',
        rfq: { connect: { id: rfqId } },
        company: { connect: { id: req.user.companyId } },
        user: { connect: { id: req.user.id } },
      },
      include: {
        rfq: true,
        company: true,
        user: true
      }
    });

    // Notify the RFQ owner about the new bid
    await NotificationService.createBidNotification(bid, rfq);

    res.status(201).json(bid);
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Failed to create bid', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getBidHistory = async (req: AuthenticatedRequest & { params: { rfqId: string } }, res: Response) => {
  try {
    const { rfqId } = req.params;
    if (!req.user?.companyId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const bidHistory = await prisma.bid.findMany({
      where: { rfqId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(bidHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bid history' });
  }
};

export const updateBidStatus = async (req: AuthenticatedRequest & { params: { bidId: string } } & { body: { status: string } }, res: Response) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First, get the bid with RFQ details
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        rfq: true
      }
    });

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Check if the requesting user is the RFQ owner
    if (bid.rfq.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this bid' });
    }

    // Update bid status
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status },
      include: {
        rfq: true,
        user: true,
        company: true
      },
    });

    // Notify the bidder about status update
    await NotificationService.createBidStatusNotification(updatedBid, status);

    res.json(updatedBid);
  } catch (error) {
    console.error('Error updating bid status:', error);
    res.status(500).json({ error: 'Failed to update bid status' });
  }
};

export const awardRFQ = async (req: AuthenticatedRequest & { body: { rfqId: string; bidId: string } }, res: Response) => {
  try {
    const { rfqId, bidId } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // First, get the RFQ with its bids
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { 
        bids: true,
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    // Verify the requesting user is the RFQ owner
    if (rfq.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to award this RFQ' });
    }

    // Check if RFQ is open
    if (rfq.status !== 'OPEN') {
      return res.status(400).json({ error: 'RFQ is not open for awarding' });
    }

    // Find the winning bid
    const winningBid = rfq.bids.find((bid: { id: string }) => bid.id === bidId);
    if (!winningBid) {
      return res.status(404).json({ error: 'Bid not found for this RFQ' });
    }

    // Update all bids to REJECTED except the winning bid
    await prisma.bid.updateMany({
      where: { 
        rfqId,
        id: { not: bidId }
      },
      data: { status: 'REJECTED' },
    });

    // Update the winning bid to ACCEPTED
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED' },
    });

    // Update RFQ status to AWARDED
    await prisma.rfq.update({
      where: { id: rfqId },
      data: { status: 'AWARDED' },
    });

    // Create notifications for all bid owners
    await NotificationService.createRFQNotification(rfq, 'UPDATE');

    res.json({ message: 'RFQ awarded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to award RFQ' });
  }
};
