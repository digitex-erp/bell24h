import { Request, Response } from "express";
import { z } from "zod";
import { db } from "@db";

// Define validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Must be a valid email").optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
});

const updateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  rfqUpdates: z.boolean().optional(),
  supplierMatches: z.boolean().optional(),
  paymentAlerts: z.boolean().optional(),
  marketInsights: z.boolean().optional(),
});

const updateSupplierSettingsSchema = z.object({
  autoApproveVerified: z.boolean().optional(),
  minRiskGrade: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
  internationalSuppliers: z.boolean().optional(),
});

/**
 * User Controller
 * Handles all user-related API endpoints
 */
class UserController {
  
  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      
      // Mock user data
      const user = {
        id: 1,
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        phone: "+91 98765 43210",
        company: "TechInnovate Solutions",
        position: "Procurement Manager",
        industry: "Manufacturing",
        location: "Bangalore, India",
        avatar: null,
        isVerified: true,
        joinedDate: "2025-01-15T08:30:00Z",
        lastActive: "2025-04-24T14:25:00Z",
        membershipType: "Premium",
        membershipExpiry: "2026-01-15T08:30:00Z"
      };
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock user data
      const user = {
        id: parseInt(id),
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        company: "TechInnovate Solutions",
        industry: "Manufacturing",
        location: "Bangalore, India",
        avatar: null,
        isVerified: true,
        joinedDate: "2025-01-15T08:30:00Z"
      };
      
      res.json(user);
    } catch (error) {
      console.error(`Error fetching user with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      
      // Mock update
      const updatedUser = {
        id: 1,
        ...validatedData,
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
  
  /**
   * Get user settings
   */
  async getUserSettings(req: Request, res: Response) {
    try {
      // Mock settings data
      const settings = {
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          rfqUpdates: true,
          supplierMatches: true,
          paymentAlerts: true,
          marketInsights: false
        },
        supplier: {
          autoApproveVerified: true,
          minRiskGrade: "B+",
          preferredCategories: ["Electronics", "Automation", "Industrial"],
          internationalSuppliers: true
        },
        appearance: {
          theme: "light",
          currency: "INR",
          language: "en"
        }
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  }
  
  /**
   * Update notification settings
   */
  async updateNotificationSettings(req: Request, res: Response) {
    try {
      const validatedData = updateNotificationSettingsSchema.parse(req.body);
      
      // Mock update
      const updatedSettings = {
        ...validatedData,
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        message: "Notification settings updated successfully",
        settings: updatedSettings
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  }
  
  /**
   * Update supplier settings
   */
  async updateSupplierSettings(req: Request, res: Response) {
    try {
      const validatedData = updateSupplierSettingsSchema.parse(req.body);
      
      // Mock update
      const updatedSettings = {
        ...validatedData,
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        message: "Supplier settings updated successfully",
        settings: updatedSettings
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating supplier settings:", error);
      res.status(500).json({ message: "Failed to update supplier settings" });
    }
  }
}

// Singleton instance
export const userController = new UserController();