import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { LogisticsTrackingService } from '../../../../../services/logistics/logistics-tracking-service';
import { db } from '../../../../../lib/db';
import { shipments } from '../../../../../lib/db/schema/logistics';
import { eq } from 'drizzle-orm';

// Initialize the logistics tracking service
const logisticsService = new LogisticsTrackingService();

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

  // Only allow POST method for refreshing tracking
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if shipment exists
    const shipmentResult = await db.select().from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);
    
    if (shipmentResult.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    const shipment = shipmentResult[0];
    
    // Make sure we have a tracking number to refresh
    if (!shipment.trackingNumber) {
      return res.status(400).json({ 
        message: 'Cannot refresh tracking: shipment does not have a tracking number yet' 
      });
    }
    
    // Use the logistics service to refresh tracking information
    const refreshResult = await logisticsService.refreshShipmentTracking({
      shipmentId,
      trackingNumber: shipment.trackingNumber,
      provider: shipment.provider,
    });
    
    // Return the refreshed tracking data
    return res.status(200).json({ 
      message: 'Shipment tracking refreshed successfully',
      updatedAt: new Date().toISOString(),
      newUpdates: refreshResult.newUpdates ?? 0
    });
  } catch (error) {
    console.error('Error refreshing shipment tracking:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to refresh shipment tracking' 
    });
  }
}
