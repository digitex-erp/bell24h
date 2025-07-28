import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { LogisticsTrackingService } from '../../../../services/logistics/logistics-tracking-service';
import { db } from '../../../../lib/db';
import { shipments, shipmentUpdates, shipmentDocuments, shipmentPackages } from '../../../../lib/db/schema/logistics';
import { eq } from 'drizzle-orm';
import { validateRequest } from '../../../../lib/middleware/validate-request';
import { z } from 'zod';

// Initialize the logistics tracking service
const logisticsService = new LogisticsTrackingService();

// Validation schema for shipment updates
const shipmentUpdateSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional().nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to access this resource' });
  }

  // Get shipment ID from the URL
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid shipment ID' });
  }

  // Convert ID to number
  const shipmentId = parseInt(id, 10);
  if (isNaN(shipmentId)) {
    return res.status(400).json({ message: 'Invalid shipment ID format' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getShipmentDetails(req, res, shipmentId);
    case 'PATCH':
      return updateShipment(req, res, shipmentId);
    case 'DELETE':
      return deleteShipment(req, res, shipmentId);
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

/**
 * GET /api/logistics/shipments/[id]
 * Get detailed information for a specific shipment
 */
async function getShipmentDetails(req: NextApiRequest, res: NextApiResponse, shipmentId: number) {
  try {
    // Get the shipment from the database
    const shipmentResult = await db.select().from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);
    
    if (shipmentResult.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    const shipment = shipmentResult[0];
    
    // Get shipment updates
    const updates = await db.select().from(shipmentUpdates)
      .where(eq(shipmentUpdates.shipmentId, shipmentId))
      .orderBy(shipmentUpdates.timestamp);
    
    // Get shipment packages
    const packages = await db.select().from(shipmentPackages)
      .where(eq(shipmentPackages.shipmentId, shipmentId));
    
    // Get shipment documents
    const documents = await db.select().from(shipmentDocuments)
      .where(eq(shipmentDocuments.shipmentId, shipmentId))
      .orderBy(shipmentDocuments.createdAt);
    
    // Format the response
    const shipmentDetails = {
      ...shipment,
      updates,
      packages,
      documents,
    };
    
    return res.status(200).json(shipmentDetails);
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    return res.status(500).json({ message: 'Failed to fetch shipment details' });
  }
}

/**
 * PATCH /api/logistics/shipments/[id]
 * Update a shipment's details
 */
async function updateShipment(req: NextApiRequest, res: NextApiResponse, shipmentId: number) {
  try {
    // Check if shipment exists
    const existingShipment = await db.select({ id: shipments.id }).from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);
    
    if (existingShipment.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Validate request data
    const validationResult = await validateRequest(req, res, shipmentUpdateSchema);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: validationResult.errors });
    }
    
    const updateData = validationResult.data;
    
    // Update shipment in the database
    await db.update(shipments)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(shipments.id, shipmentId));
    
    return res.status(200).json({ message: 'Shipment updated successfully' });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return res.status(500).json({ message: 'Failed to update shipment' });
  }
}

/**
 * DELETE /api/logistics/shipments/[id]
 * Delete a shipment
 */
async function deleteShipment(req: NextApiRequest, res: NextApiResponse, shipmentId: number) {
  try {
    // Check if shipment exists
    const existingShipment = await db.select({ id: shipments.id }).from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);
    
    if (existingShipment.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Delete related records first (due to foreign key constraints)
    await db.delete(shipmentUpdates).where(eq(shipmentUpdates.shipmentId, shipmentId));
    await db.delete(shipmentDocuments).where(eq(shipmentDocuments.shipmentId, shipmentId));
    await db.delete(shipmentPackages).where(eq(shipmentPackages.shipmentId, shipmentId));
    
    // Delete the shipment
    await db.delete(shipments).where(eq(shipments.id, shipmentId));
    
    return res.status(200).json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return res.status(500).json({ message: 'Failed to delete shipment' });
  }
}
