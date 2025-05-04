import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db";
import { rfqs } from "../../shared/schema";

// Define validation schemas
const createRfqSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  quantity: z.number().optional(),
  budget: z.number().optional(),
  deadline: z.string().optional(),
  type: z.string().default("standard"),
  mediaUrl: z.string().optional(),
});

/**
 * RFQ Controller
 * Handles all RFQ-related API endpoints
 */
class RfqController {
  
  /**
   * Get all RFQs
   */
  async getRfqs(req: Request, res: Response) {
    try {
      // Mock RFQ data
      const mockRfqs = [
        {
          id: 1,
          title: "Industrial Automation Components",
          description: "Looking for PLC controllers and HMI panels for a factory automation project",
          category: "Electronics",
          quantity: 15,
          budget: 50000,
          deadline: "2025-05-15",
          status: "active",
          createdAt: "2025-04-10T10:30:00Z",
          type: "standard",
          mediaUrl: null,
          responses: 3
        },
        {
          id: 2,
          title: "Office Furniture Procurement",
          description: "Need ergonomic chairs and adjustable desks for new office setup",
          category: "Furniture",
          quantity: 30,
          budget: 150000,
          deadline: "2025-05-30",
          status: "active",
          createdAt: "2025-04-12T14:15:00Z",
          type: "standard",
          mediaUrl: null,
          responses: 5
        },
        {
          id: 3,
          title: "Industrial Cleaning Supplies",
          description: "Requirement for eco-friendly cleaning solutions for manufacturing facility",
          category: "Supplies",
          quantity: null,
          budget: 25000,
          deadline: "2025-05-10",
          status: "active",
          createdAt: "2025-04-14T09:45:00Z",
          type: "voice",
          mediaUrl: "https://example.com/audio/12345",
          responses: 2
        },
        {
          id: 4,
          title: "Electronic Components Bulk Order",
          description: "Looking for resistors, capacitors, and microchips for production line",
          category: "Electronics",
          quantity: 5000,
          budget: 120000,
          deadline: "2025-06-05",
          status: "active",
          createdAt: "2025-04-15T11:00:00Z",
          type: "video", 
          mediaUrl: "https://example.com/video/67890",
          responses: 0
        }
      ];
      
      res.json({ rfqs: mockRfqs });
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  }
  
  /**
   * Get RFQ by ID
   */
  async getRfqById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock RFQ data
      const rfq = {
        id: parseInt(id),
        title: "Industrial Automation Components",
        description: "Looking for PLC controllers and HMI panels for a factory automation project. We need high-quality components that meet industrial standards and have good warranty coverage. The components will be used in a 24/7 manufacturing environment.",
        category: "Electronics",
        quantity: 15,
        budget: 50000,
        deadline: "2025-05-15",
        status: "active",
        createdAt: "2025-04-10T10:30:00Z",
        type: "standard",
        mediaUrl: null,
        responses: 3,
        additionalRequirements: "Components must have CE certification and meet IP65 protection standards."
      };
      
      res.json(rfq);
    } catch (error) {
      console.error(`Error fetching RFQ with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch RFQ" });
    }
  }
  
  /**
   * Create a new RFQ
   */
  async createRfq(req: Request, res: Response) {
    try {
      const validatedData = createRfqSchema.parse(req.body);
      
      // In a real implementation, this would insert into the database
      const newRfq = {
        id: Math.floor(Math.random() * 1000) + 5,
        ...validatedData,
        status: "active",
        createdAt: new Date().toISOString(),
        responses: 0
      };
      
      res.status(201).json(newRfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating RFQ:", error);
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  }
  
  /**
   * Update an RFQ
   */
  async updateRfq(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = createRfqSchema.partial().parse(req.body);
      
      // Mock update
      const updatedRfq = {
        id: parseInt(id),
        ...validatedData,
        status: req.body.status || "active",
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedRfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating RFQ with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update RFQ" });
    }
  }
  
  /**
   * Delete an RFQ
   */
  async deleteRfq(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock deletion
      res.json({ message: `RFQ with ID ${id} has been deleted` });
    } catch (error) {
      console.error(`Error deleting RFQ with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete RFQ" });
    }
  }
  
  /**
   * Get matched suppliers for an RFQ
   */
  async getMatchedSuppliers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock matched suppliers
      const suppliers = [
        {
          id: 101,
          companyName: "TechPro Solutions",
          description: "Leading provider of automation and electronic components with global certifications",
          location: "Mumbai, India",
          categories: ["Electronics", "Automation", "IoT"],
          logo: null,
          matchScore: 4.8,
          riskScore: 1.5,
          riskGrade: "A+",
          verified: true
        },
        {
          id: 102,
          companyName: "ElectroIndia Components",
          description: "Specialized in industrial electronic components with 15+ years experience",
          location: "Pune, India",
          categories: ["Electronics", "Industrial"],
          logo: null,
          matchScore: 4.5,
          riskScore: 1.8,
          riskGrade: "A",
          verified: true
        },
        {
          id: 103,
          companyName: "AutoTech Controls",
          description: "Manufacturer of PLC controllers and HMI panels for industrial automation",
          location: "Chennai, India",
          categories: ["Automation", "Control Systems"],
          logo: null,
          matchScore: 4.2,
          riskScore: 2.1,
          riskGrade: "B+",
          verified: true
        },
        {
          id: 104,
          companyName: "Global Electronics Co.",
          description: "International supplier of electronic components and automation solutions",
          location: "Singapore",
          categories: ["Electronics", "Automation"],
          logo: null,
          matchScore: 3.9,
          riskScore: 2.4,
          riskGrade: "B",
          verified: false
        }
      ];
      
      res.json({ rfqId: parseInt(id), suppliers });
    } catch (error) {
      console.error(`Error fetching matched suppliers for RFQ ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch matched suppliers" });
    }
  }
  
  /**
   * Invite a supplier to an RFQ
   */
  async inviteSupplier(req: Request, res: Response) {
    try {
      const { id, supplierId } = req.params;
      
      // Mock invitation
      res.json({
        message: `Supplier ${supplierId} has been invited to RFQ ${id}`,
        invitation: {
          rfqId: parseInt(id),
          supplierId: parseInt(supplierId),
          status: "pending",
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Error inviting supplier ${req.params.supplierId} to RFQ ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to invite supplier" });
    }
  }
  
  /**
   * Invite a supplier with a new RFQ
   */
  async inviteSupplierWithNewRfq(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;
      
      // Mock invitation with new RFQ
      res.json({
        message: `Supplier ${supplierId} has been invited with a new RFQ`,
        invitation: {
          rfqId: Math.floor(Math.random() * 1000) + 5,
          supplierId: parseInt(supplierId),
          status: "pending",
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Error inviting supplier ${req.params.supplierId} with new RFQ:`, error);
      res.status(500).json({ message: "Failed to invite supplier" });
    }
  }
}

// Singleton instance
export const rfqController = new RfqController();