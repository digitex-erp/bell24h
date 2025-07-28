import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { LogisticsTrackingService, DocumentType } from '../../../../../services/logistics/logistics-tracking-service';
import { db } from '../../../../../lib/db';
import { shipments, shipmentDocuments } from '../../../../../lib/db/schema/logistics';
import { eq } from 'drizzle-orm';
import { validateRequest } from '../../../../../lib/middleware/validate-request';
import { z } from 'zod';

// Initialize the logistics tracking service
const logisticsService = new LogisticsTrackingService();

// Validation schema for document generation
const documentGenerateSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  customData: z.record(z.string()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to access this resource' });
  }

  // Get shipment ID from the URL
  const { shipmentId } = req.query;
  if (!shipmentId || Array.isArray(shipmentId)) {
    return res.status(400).json({ message: 'Invalid shipment ID' });
  }

  // Convert ID to number
  const shipmentIdNum = parseInt(shipmentId, 10);
  if (isNaN(shipmentIdNum)) {
    return res.status(400).json({ message: 'Invalid shipment ID format' });
  }

  // Only allow POST method for generating documents
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Check if shipment exists
    const shipmentResult = await db.select().from(shipments)
      .where(eq(shipments.id, shipmentIdNum))
      .limit(1);
    
    if (shipmentResult.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Validate request data
    const validationResult = await validateRequest(req, res, documentGenerateSchema);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: validationResult.errors });
    }
    
    const { documentType, customData = {} } = validationResult.data;
    
    // Generate the document using the logistics service
    const document = await logisticsService.generateCustomsDocument({
      shipmentId: shipmentIdNum,
      documentType,
      customData,
    });
    
    // Return the generated document information
    return res.status(201).json(document);
  } catch (error) {
    console.error('Error generating document:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate document' 
    });
  }
}
