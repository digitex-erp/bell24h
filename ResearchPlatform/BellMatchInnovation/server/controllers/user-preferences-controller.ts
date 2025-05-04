import { Request, Response } from "express";
import { db } from "@db";
import { userPreferences, users, rfqs, quotes, supplierMetrics, insertUserPreferencesSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import openai from "@/lib/openai";

// Schema for validating preference update requests
const updatePreferencesSchema = z.object({
  preferredCategories: z.array(z.string()).optional(),
  preferredSupplierTypes: z.array(z.string()).optional(),
  preferredBusinessScale: z.string().nullable().optional(),
  preferredPriceRange: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
  }).optional(),
  qualityPreference: z.number().min(1).max(5).optional(),
  languagePreference: z.string().optional(),
  communicationPreference: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  industryFocus: z.array(z.string()).optional(),
  deliveryTimePreference: z.string().optional(),
});

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user preferences
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId)
    });

    // If no preferences exist yet, return default values
    if (!preferences) {
      const defaultPreferences = {
        preferredCategories: [],
        preferredPriceRange: null,
        preferredSupplierTypes: [],
        preferredBusinessScale: null,
        languagePreference: "en",
        communicationPreference: "email"
      };
      return res.json(defaultPreferences);
    }

    return res.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return res.status(500).json({ error: "Failed to fetch user preferences" });
  }
};

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate request body
    const validatedData = updatePreferencesSchema.parse(req.body);
    
    // Check if user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if preferences exist
    const existingPreferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId)
    });

    if (existingPreferences) {
      // Update existing preferences
      const updatedPreferences = await db
        .update(userPreferences)
        .set({
          ...validatedData,
          lastUpdated: new Date()
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      return res.json(updatedPreferences[0]);
    } else {
      // Create new preferences
      const newPreferences = await db
        .insert(userPreferences)
        .values({
          userId,
          ...validatedData,
          lastUpdated: new Date()
        })
        .returning();

      return res.status(201).json(newPreferences[0]);
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ error: "Failed to update user preferences" });
  }
};

export const generateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get existing preferences
    const existingPreferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId)
    }) || {
      preferredCategories: [],
      preferredSupplierTypes: [],
      preferredBusinessScale: null,
      preferredPriceRange: { min: null, max: null },
      qualityPreference: 3,
      preferredLocations: [],
      industryFocus: [],
      languagePreference: "en",
      communicationPreference: "email",
    };

    // Get user's RFQ history
    const userRfqs = await db.query.rfqs.findMany({
      where: eq(rfqs.userId, userId),
      orderBy: [desc(rfqs.createdAt)],
      limit: 20
    });

    // Get user's interaction history (quotes they've accepted)
    const acceptedQuotes = await db.query.quotes.findMany({
      where: and(
        eq(quotes.isAccepted, true),
        eq(rfqs.userId, userId)
      ),
      with: {
        rfq: true,
        supplier: true
      },
      limit: 10
    });

    // If we don't have enough data, just use existing preferences
    if (userRfqs.length === 0) {
      return res.status(400).json({ 
        error: "Not enough user data to generate preferences",
        preferences: existingPreferences
      });
    }

    // Generate preferences using OpenAI
    const enhancedPreferences = await openai.enhanceUserPreferences(
      existingPreferences,
      userRfqs,
      acceptedQuotes
    );

    // Update or create preferences
    if (await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) })) {
      // Update existing preferences
      const updatedPreferences = await db
        .update(userPreferences)
        .set({
          ...enhancedPreferences,
          lastUpdated: new Date()
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      return res.json({ 
        message: "Preferences automatically generated based on your activity history", 
        preferences: updatedPreferences[0]
      });
    } else {
      // Create new preferences
      const newPreferences = await db
        .insert(userPreferences)
        .values({
          userId,
          ...enhancedPreferences,
          lastUpdated: new Date()
        })
        .returning();

      return res.json({ 
        message: "Preferences automatically generated based on your activity history", 
        preferences: newPreferences[0]
      });
    }
  } catch (error) {
    console.error("Error generating user preferences:", error);
    return res.status(500).json({ error: "Failed to generate preferences" });
  }
};