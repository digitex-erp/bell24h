/**
 * Storage service for Bell24h platform
 * Handles data persistence for various features
 */
import { db } from '../db';
import { rfqs, users, suppliers, userPreferences } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface ChatbotInteraction {
  timestamp: Date;
  userId: number | null;
  message: string;
  responseType: string;
  success: boolean;
  error?: string;
}

interface ProcurementInsightsRequest {
  userId: number;
  categories: string[];
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface RfqOptimizationRequest {
  userId: number;
  rfqId: number | string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface SupplierCompatibilityRequest {
  userId: number;
  rfqId: number;
  supplierIds: number[];
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface NegotiationTalkingPointsRequest {
  userId: number;
  rfqId: number;
  supplierId: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

class StorageService {
  /**
   * Log a chatbot interaction for analytics purposes
   * 
   * @param interaction Interaction details to log
   * @returns Success status
   */
  async logChatbotInteraction(interaction: ChatbotInteraction): Promise<boolean> {
    try {
      // For now, just log to console as we don't have a dedicated table
      // In a real implementation, we would store in the database
      console.log('Chatbot interaction logged:', {
        timestamp: interaction.timestamp,
        userId: interaction.userId,
        messageLength: interaction.message.length,
        responseType: interaction.responseType,
        success: interaction.success
      });
      
      return true;
    } catch (error) {
      console.error('Error logging chatbot interaction:', error);
      return false;
    }
  }
  
  /**
   * Get a user's preferences from the database
   * 
   * @param userId User ID
   * @returns User preferences or default preferences if not found
   */
  async getUserPreferences(userId: number): Promise<any> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return null;
      }
      
      // Get user preferences
      const preferences = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId)
      });
      
      // Return preferences or default values
      return preferences || {
        preferredCategories: [],
        preferredPriceRange: null,
        preferredSupplierTypes: [],
        preferredBusinessScale: null,
        languagePreference: 'en',
        communicationPreference: 'email'
      };
    } catch (error) {
      console.error(`Error getting preferences for user #${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Get a user's recent RFQs for context
   * 
   * @param userId User ID
   * @param limit Maximum number of RFQs to return (default: 5)
   * @returns Array of recent RFQs
   */
  async getUserRecentRfqs(userId: number, limit: number = 5): Promise<any[]> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return [];
      }
      
      // Get recent RFQs from the database
      const recentRfqs = await db.query.rfqs.findMany({
        where: eq(rfqs.userId, userId),
        orderBy: (rfqs, { desc }) => [desc(rfqs.createdAt)],
        limit
      });
      
      return recentRfqs;
    } catch (error) {
      console.error(`Error getting recent RFQs for user #${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Get an RFQ by ID
   * 
   * @param rfqId RFQ ID
   * @returns RFQ details or null if not found
   */
  async getRfqById(rfqId: number): Promise<any | null> {
    try {
      const rfq = await db.query.rfqs.findFirst({
        where: eq(rfqs.id, rfqId),
        with: {
          user: true
        }
      });
      
      return rfq;
    } catch (error) {
      console.error(`Error getting RFQ #${rfqId}:`, error);
      return null;
    }
  }
  
  /**
   * Get a supplier by ID
   * 
   * @param supplierId Supplier ID
   * @returns Supplier details or null if not found
   */
  async getSupplierById(supplierId: number): Promise<any | null> {
    try {
      // Note: This is a placeholder as we don't have a suppliers table yet
      // In a real implementation, we would query the database
      
      // Mock data for testing
      if (supplierId === 1) {
        return {
          id: 1,
          name: 'Acme Electronics',
          contactPerson: 'John Doe',
          email: 'john@acmeelectronics.com',
          phone: '+1-555-123-4567',
          rating: 4.7,
          categories: ['Electronics', 'Hardware'],
          location: 'San Francisco, CA',
          deliveryTime: '3-5 days',
          minimumOrderQuantity: 100,
          establishedYear: 2005,
          certifications: ['ISO 9001', 'CE'],
          previousOrders: 247
        };
      } else if (supplierId === 2) {
        return {
          id: 2,
          name: 'Global Materials Inc.',
          contactPerson: 'Jane Smith',
          email: 'jane@globalmaterials.com',
          phone: '+1-555-987-6543',
          rating: 4.2,
          categories: ['Raw Materials', 'Chemicals'],
          location: 'Chicago, IL',
          deliveryTime: '7-10 days',
          minimumOrderQuantity: 500,
          establishedYear: 1998,
          certifications: ['ISO 14001', 'REACH'],
          previousOrders: 189
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting supplier #${supplierId}:`, error);
      return null;
    }
  }
  
  /**
   * Get market data for a specific category
   * 
   * @param category Product/service category
   * @returns Market data for the category or null if not available
   */
  async getMarketDataForCategory(category: string): Promise<any | null> {
    try {
      // Note: This is a placeholder as we don't have market data yet
      // In a real implementation, we would query an external API or database
      
      // Mock data for testing
      const marketData = {
        category,
        averagePrice: '$120.50 per unit',
        priceVolatility: 'Low',
        leadTimeAverage: '14 days',
        supplyConstraints: 'None currently reported',
        demandTrend: 'Increasing by 5% quarter-over-quarter',
        topSuppliers: [
          'Acme Electronics',
          'Global Materials Inc.',
          'TechSupply Co.'
        ],
        regionalAvailability: {
          northAmerica: 'High',
          europe: 'Medium',
          asia: 'Very High',
          southAmerica: 'Low',
          africa: 'Very Low'
        },
        sustainabilityMetrics: {
          carbonFootprint: 'Medium',
          recycledMaterials: '35%',
          renewableEnergy: '42%'
        }
      };
      
      return marketData;
    } catch (error) {
      console.error(`Error getting market data for category "${category}":`, error);
      return null;
    }
  }
  
  /**
   * Log a procurement insights request for analytics
   * 
   * @param request Procurement insights request details
   * @returns Success status
   */
  async logProcurementInsightsRequest(request: ProcurementInsightsRequest): Promise<boolean> {
    try {
      // For now, just log to console as we don't have a dedicated table
      console.log('Procurement insights request logged:', {
        timestamp: request.timestamp,
        userId: request.userId,
        categories: request.categories,
        success: request.success,
        error: request.error || null
      });
      
      return true;
    } catch (error) {
      console.error('Error logging procurement insights request:', error);
      return false;
    }
  }
  
  /**
   * Log an RFQ optimization request for analytics
   * 
   * @param request RFQ optimization request details
   * @returns Success status
   */
  async logRfqOptimizationRequest(request: RfqOptimizationRequest): Promise<boolean> {
    try {
      // For now, just log to console as we don't have a dedicated table
      console.log('RFQ optimization request logged:', {
        timestamp: request.timestamp,
        userId: request.userId,
        rfqId: request.rfqId,
        success: request.success,
        error: request.error || null
      });
      
      return true;
    } catch (error) {
      console.error('Error logging RFQ optimization request:', error);
      return false;
    }
  }
  
  /**
   * Log a supplier compatibility analysis request for analytics
   * 
   * @param request Supplier compatibility request details
   * @returns Success status
   */
  async logSupplierCompatibilityRequest(request: SupplierCompatibilityRequest): Promise<boolean> {
    try {
      // For now, just log to console as we don't have a dedicated table
      console.log('Supplier compatibility request logged:', {
        timestamp: request.timestamp,
        userId: request.userId,
        rfqId: request.rfqId,
        supplierCount: request.supplierIds.length,
        success: request.success,
        error: request.error || null
      });
      
      return true;
    } catch (error) {
      console.error('Error logging supplier compatibility request:', error);
      return false;
    }
  }
  
  /**
   * Log a negotiation talking points request for analytics
   * 
   * @param request Negotiation talking points request details
   * @returns Success status
   */
  async logNegotiationTalkingPointsRequest(request: NegotiationTalkingPointsRequest): Promise<boolean> {
    try {
      // For now, just log to console as we don't have a dedicated table
      console.log('Negotiation talking points request logged:', {
        timestamp: request.timestamp,
        userId: request.userId,
        rfqId: request.rfqId,
        supplierId: request.supplierId,
        success: request.success,
        error: request.error || null
      });
      
      return true;
    } catch (error) {
      console.error('Error logging negotiation talking points request:', error);
      return false;
    }
  }
  
  /**
   * Get historical interactions between an RFQ and a supplier
   * 
   * @param rfqId RFQ ID
   * @param supplierId Supplier ID
   * @returns Historical interactions or null if none found
   */
  async getHistoricalInteractions(rfqId: number, supplierId: number): Promise<any | null> {
    try {
      // Note: This is a placeholder as we don't have an interactions table yet
      // In a real implementation, we would query the database
      
      // For demo purposes, return a basic interactions object for one specific combination
      if (rfqId === 1 && supplierId === 1) {
        return {
          rfqId,
          supplierId,
          interactions: [
            {
              date: new Date('2025-03-15'),
              type: 'message',
              content: 'Initial inquiry about product specifications'
            },
            {
              date: new Date('2025-03-17'),
              type: 'message',
              content: 'Discussion about delivery timeline'
            },
            {
              date: new Date('2025-03-20'),
              type: 'call',
              duration: '45 minutes',
              summary: 'Detailed discussion about technical requirements'
            }
          ],
          previousOrders: 3,
          averageResponseTime: '8 hours',
          averagePriceVariance: '+5%',
          negotiationHistory: 'Typically requests 3-5% discounts for bulk orders'
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting historical interactions for RFQ #${rfqId} and supplier #${supplierId}:`, error);
      return null;
    }
  }

  /**
   * Get supplier details by user ID
   * 
   * @param userId User ID
   * @returns Supplier details or null if not found
   */
  async getSupplierByUserId(userId: number): Promise<any | null> {
    try {
      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.userId, userId)
      });
      
      return supplier || null;
    } catch (error) {
      console.error('Error fetching supplier by user ID:', error);
      return null;
    }
  }
  
  /**
   * Create a new supplier with GST validation
   * 
   * @param supplierData Supplier data including GST validation fields
   * @returns Created supplier details
   */
  async createSupplier(supplierData: any): Promise<any> {
    try {
      // Insert new supplier
      const [newSupplier] = await db.insert(suppliers).values({
        userId: supplierData.userId,
        companyName: supplierData.companyName,
        description: supplierData.description,
        location: supplierData.location,
        categories: supplierData.categories,
        logo: supplierData.logo,
        // GST validation fields
        gstin: supplierData.gstin,
        gstinVerified: supplierData.gstinVerified || false,
        gstinVerificationDate: supplierData.gstinVerificationDate,
        legalName: supplierData.legalName,
        tradeName: supplierData.tradeName,
        taxPayerType: supplierData.taxPayerType,
        businessType: supplierData.businessType,
        registrationDate: supplierData.registrationDate,
        complianceRating: supplierData.complianceRating,
        // Initial risk assessment
        riskScore: supplierData.gstin && supplierData.gstinVerified ? 1.5 : 3.0,
        riskGrade: supplierData.gstin && supplierData.gstinVerified ? "A" : "C",
        verified: supplierData.gstinVerified || false,
      }).returning();
      
      return newSupplier;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }
  
  /**
   * Update supplier with GST validation information
   * 
   * @param supplierId Supplier ID
   * @param updateData Supplier data to update
   * @returns Updated supplier details
   */
  async updateSupplierGstInfo(supplierId: number, updateData: any): Promise<any> {
    try {
      // Update supplier with GST information
      const [updatedSupplier] = await db.update(suppliers)
        .set({
          gstin: updateData.gstin,
          gstinVerified: updateData.gstinVerified,
          gstinVerificationDate: updateData.gstinVerificationDate,
          legalName: updateData.legalName,
          tradeName: updateData.tradeName,
          taxPayerType: updateData.taxPayerType,
          businessType: updateData.businessType,
          registrationDate: updateData.registrationDate,
          complianceRating: updateData.complianceRating,
          riskScore: updateData.gstinVerified ? 1.5 : 3.0,
          riskGrade: updateData.gstinVerified ? "A" : "C",
          verified: updateData.gstinVerified,
          updatedAt: new Date()
        })
        .where(eq(suppliers.id, supplierId))
        .returning();
      
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating supplier GST info:', error);
      throw error;
    }
  }
}

export const storage = new StorageService();