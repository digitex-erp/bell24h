import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db";
import { suppliers } from "../../shared/schema";

// Define validation schemas
const createSupplierSchema = z.object({
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  categories: z.array(z.string()),
  logo: z.string().optional(),
});

/**
 * Suppliers Controller
 * Handles all supplier-related API endpoints
 */
class SuppliersController {
  
  /**
   * Get all suppliers
   */
  async getSuppliers(req: Request, res: Response) {
    try {
      // Mock suppliers data
      const mockSuppliers = [
        {
          id: 101,
          companyName: "TechPro Solutions",
          description: "Leading provider of automation and electronic components with global certifications",
          location: "Mumbai, India",
          categories: ["Electronics", "Automation", "IoT"],
          logo: null,
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
          riskScore: 2.4,
          riskGrade: "B",
          verified: false
        },
        {
          id: 105,
          companyName: "IndiaTech Services",
          description: "Comprehensive technical services and component supplies for manufacturing",
          location: "Delhi, India",
          categories: ["Industrial", "Services"],
          logo: null,
          riskScore: 3.2,
          riskGrade: "C+",
          verified: false
        }
      ];
      
      res.json({ suppliers: mockSuppliers });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  }
  
  /**
   * Get matched suppliers for general recommendation
   */
  async getMatchedSuppliers(req: Request, res: Response) {
    try {
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
        }
      ];
      
      res.json({ suppliers });
    } catch (error) {
      console.error("Error fetching matched suppliers:", error);
      res.status(500).json({ message: "Failed to fetch matched suppliers" });
    }
  }
  
  /**
   * Get suppliers with risk scores
   */
  async getSuppliersWithRisk(req: Request, res: Response) {
    try {
      // Mock suppliers with risk data
      const suppliers = [
        {
          id: 101,
          companyName: "TechPro Solutions",
          description: "Leading provider of automation and electronic components with global certifications",
          location: "Mumbai, India",
          categories: ["Electronics", "Automation", "IoT"],
          logo: null,
          riskScore: 1.5,
          riskGrade: "A+",
          verified: true,
          riskFactors: {
            financial: 1.2,
            delivery: 1.5,
            quality: 1.3,
            compliance: 1.8,
            reputation: 1.7
          }
        },
        {
          id: 102,
          companyName: "ElectroIndia Components",
          description: "Specialized in industrial electronic components with 15+ years experience",
          location: "Pune, India",
          categories: ["Electronics", "Industrial"],
          logo: null,
          riskScore: 1.8,
          riskGrade: "A",
          verified: true,
          riskFactors: {
            financial: 1.6,
            delivery: 1.9,
            quality: 1.5,
            compliance: 2.0,
            reputation: 2.0
          }
        },
        {
          id: 103,
          companyName: "AutoTech Controls",
          description: "Manufacturer of PLC controllers and HMI panels for industrial automation",
          location: "Chennai, India",
          categories: ["Automation", "Control Systems"],
          logo: null,
          riskScore: 2.1,
          riskGrade: "B+",
          verified: true,
          riskFactors: {
            financial: 2.0,
            delivery: 2.2,
            quality: 1.8,
            compliance: 2.1,
            reputation: 2.4
          }
        },
        {
          id: 104,
          companyName: "Global Electronics Co.",
          description: "International supplier of electronic components and automation solutions",
          location: "Singapore",
          categories: ["Electronics", "Automation"],
          logo: null,
          riskScore: 2.4,
          riskGrade: "B",
          verified: false,
          riskFactors: {
            financial: 2.2,
            delivery: 2.6,
            quality: 2.0,
            compliance: 2.5,
            reputation: 2.7
          }
        },
        {
          id: 105,
          companyName: "IndiaTech Services",
          description: "Comprehensive technical services and component supplies for manufacturing",
          location: "Delhi, India",
          categories: ["Industrial", "Services"],
          logo: null,
          riskScore: 3.2,
          riskGrade: "C+",
          verified: false,
          riskFactors: {
            financial: 3.6,
            delivery: 3.2,
            quality: 2.8,
            compliance: 3.1,
            reputation: 3.3
          }
        },
        {
          id: 106,
          companyName: "Eastern Components",
          description: "Budget component supplier for electronics and automation",
          location: "Kolkata, India",
          categories: ["Electronics", "Budget"],
          logo: null,
          riskScore: 3.8,
          riskGrade: "C",
          verified: false,
          riskFactors: {
            financial: 4.1,
            delivery: 3.9,
            quality: 3.5,
            compliance: 3.6,
            reputation: 3.9
          }
        },
        {
          id: 107,
          companyName: "New Tech Enterprises",
          description: "Recently established tech components supplier",
          location: "Hyderabad, India",
          categories: ["Electronics", "Startups"],
          logo: null,
          riskScore: 4.2,
          riskGrade: "D+",
          verified: false,
          riskFactors: {
            financial: 4.5,
            delivery: 4.1,
            quality: 3.9,
            compliance: 4.3,
            reputation: 4.2
          }
        }
      ];
      
      res.json({ suppliers });
    } catch (error) {
      console.error("Error fetching suppliers with risk data:", error);
      res.status(500).json({ message: "Failed to fetch supplier risk data" });
    }
  }
  
  /**
   * Get supplier by ID
   */
  async getSupplierById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock supplier data
      const supplier = {
        id: parseInt(id),
        companyName: "TechPro Solutions",
        description: "Leading provider of automation and electronic components with global certifications. We specialize in high-quality industrial components for manufacturing and automation processes.",
        location: "Mumbai, India",
        categories: ["Electronics", "Automation", "IoT"],
        logo: null,
        riskScore: 1.5,
        riskGrade: "A+",
        verified: true,
        yearEstablished: 2005,
        employeeCount: "100-250",
        annualRevenue: "₹50-100 Crore",
        certifications: ["ISO 9001", "ISO 14001", "CE Mark"],
        keyClients: ["Tata Motors", "Mahindra", "Godrej"],
        contactEmail: "info@techprosolutions.in",
        website: "https://techprosolutions.in"
      };
      
      res.json(supplier);
    } catch (error) {
      console.error(`Error fetching supplier with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  }
  
  /**
   * Create a new supplier
   */
  async createSupplier(req: Request, res: Response) {
    try {
      const validatedData = createSupplierSchema.parse(req.body);
      
      // In a real implementation, this would insert into the database
      const newSupplier = {
        id: Math.floor(Math.random() * 1000) + 200,
        ...validatedData,
        verified: false,
        riskScore: 3.5,
        riskGrade: "C+",
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  }
  
  /**
   * Update a supplier
   */
  async updateSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = createSupplierSchema.partial().parse(req.body);
      
      // Mock update
      const updatedSupplier = {
        id: parseInt(id),
        ...validatedData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(`Error updating supplier with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  }
}

// Singleton instance
export const suppliersController = new SuppliersController();