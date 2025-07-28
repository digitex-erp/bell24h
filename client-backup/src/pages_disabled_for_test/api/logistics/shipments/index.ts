import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { LogisticsTrackingService } from '../../../../services/logistics/logistics-tracking-service';
import { db } from '../../../../lib/db';
import { shipments } from '../../../../lib/db/schema/logistics';
import { desc, asc, eq, and, or, like } from 'drizzle-orm';
import { validateRequest } from '../../../../lib/middleware/validate-request';
import { z } from 'zod';

// Initialize the logistics tracking service
const logisticsService = new LogisticsTrackingService();

// Schema for shipment creation validation
const shipmentCreateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  provider: z.string().min(1, "Provider is required"),
  pickup: z.object({
    address: z.string().min(1, "Pickup address is required"),
    city: z.string().min(1, "Pickup city is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Pickup country is required"),
    postalCode: z.string().min(1, "Pickup postal code is required"),
    contactName: z.string().min(1, "Pickup contact name is required"),
    contactPhone: z.string().min(1, "Pickup contact phone is required"),
  }),
  delivery: z.object({
    address: z.string().min(1, "Delivery address is required"),
    city: z.string().min(1, "Delivery city is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Delivery country is required"),
    postalCode: z.string().min(1, "Delivery postal code is required"),
    contactName: z.string().min(1, "Delivery contact name is required"),
    contactPhone: z.string().min(1, "Delivery contact phone is required"),
  }),
  packages: z.array(
    z.object({
      weight: z.number().positive("Weight must be positive"),
      length: z.number().positive("Length must be positive"),
      width: z.number().positive("Width must be positive"),
      height: z.number().positive("Height must be positive"),
      description: z.string().min(1, "Package description is required"),
      value: z.number().positive("Value must be positive"),
      currency: z.string().min(1, "Currency is required"),
    })
  ).min(1, "At least one package is required"),
  isInternational: z.boolean().default(false),
  customsInfo: z.object({
    declarationType: z.string(),
    declarationValue: z.number(),
    currency: z.string(),
    contentDescription: z.string(),
    hsCode: z.string().optional(),
    originCountry: z.string(),
  }).optional(),
  serviceType: z.string().optional(),
  isExpress: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to access this resource' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getShipments(req, res);
    case 'POST':
      return createShipment(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

/**
 * GET /api/logistics/shipments
 * Get all shipments with optional filters and sorting
 */
async function getShipments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sort = 'createdAt', order = 'desc', status, provider, search } = req.query;
    
    // Build query with filters
    let query = db.select({
      id: shipments.id,
      orderId: shipments.orderId,
      trackingNumber: shipments.trackingNumber,
      provider: shipments.provider,
      status: shipments.status,
      createdAt: shipments.createdAt,
      updatedAt: shipments.updatedAt,
      estimatedDelivery: shipments.estimatedDelivery,
      origin: shipments.pickupCity,  // Simplified for list view
      destination: shipments.deliveryCity, // Simplified for list view
      isInternational: shipments.isInternational,
    }).from(shipments);
    
    // Apply filters
    const whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(shipments.status, status as string));
    }
    
    if (provider) {
      whereConditions.push(eq(shipments.provider, provider as string));
    }
    
    if (search) {
      whereConditions.push(
        or(
          like(shipments.orderId, `%${search}%`),
          like(shipments.trackingNumber, `%${search}%`),
          like(shipments.pickupCity, `%${search}%`),
          like(shipments.deliveryCity, `%${search}%`),
        )
      );
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    // Apply sorting
    if (sort === 'id') {
      query = query.orderBy(order === 'asc' ? asc(shipments.id) : desc(shipments.id));
    } else if (sort === 'createdAt') {
      query = query.orderBy(order === 'asc' ? asc(shipments.createdAt) : desc(shipments.createdAt));
    } else if (sort === 'estimatedDelivery') {
      query = query.orderBy(order === 'asc' ? asc(shipments.estimatedDelivery) : desc(shipments.estimatedDelivery));
    }
    
    const results = await query;
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return res.status(500).json({ message: 'Failed to fetch shipments' });
  }
}

/**
 * POST /api/logistics/shipments
 * Create a new shipment
 */
async function createShipment(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request data
    const validationResult = await validateRequest(req, res, shipmentCreateSchema);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: validationResult.errors });
    }
    
    const shipmentData = validationResult.data;
    
    // Create shipment using the logistics service
    const result = await logisticsService.createShipment(shipmentData);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating shipment:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create shipment' 
    });
  }
}
