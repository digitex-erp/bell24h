import { Request, Response } from "express";
import { industryTrendsService } from "../services/industry-trends.service";
import { AuthRequest } from "../utils";

/**
 * Industry Trends Controller
 * Handles API requests for industry trend snapshots and related features
 */

/**
 * Generate a one-click industry trend snapshot
 */
export async function generateOneClickSnapshot(req: AuthRequest, res: Response) {
  try {
    const { industry, region } = req.body;
    
    if (!industry) {
      return res.status(400).json({ error: "Industry is required" });
    }
    
    // Use authenticated user ID if available
    const userId = req.user?.id;
    
    // Generate snapshot
    const snapshot = await industryTrendsService.generateOneClickSnapshot(industry, region, userId);
    
    return res.status(201).json(snapshot);
  } catch (error: any) {
    console.error("Error generating industry trend snapshot:", error);
    return res.status(500).json({ 
      error: "Failed to generate industry trend snapshot",
      message: error.message 
    });
  }
}

/**
 * Get featured industries for the one-click generator
 */
export async function getFeaturedIndustries(_req: Request, res: Response) {
  try {
    const featuredIndustries = await industryTrendsService.getFeaturedIndustries();
    return res.json(featuredIndustries);
  } catch (error: any) {
    console.error("Error fetching featured industries:", error);
    return res.status(500).json({ 
      error: "Failed to fetch featured industries",
      message: error.message 
    });
  }
}

/**
 * Get all available industries for selection
 */
export async function getAllIndustries(_req: Request, res: Response) {
  try {
    const industries = await industryTrendsService.getAllIndustries();
    return res.json(industries);
  } catch (error: any) {
    console.error("Error fetching industries:", error);
    return res.status(500).json({ 
      error: "Failed to fetch industries",
      message: error.message 
    });
  }
}

/**
 * Subscribe to weekly trend updates
 */
export async function subscribeTrendUpdates(req: AuthRequest, res: Response) {
  try {
    const { email, industryId } = req.body;
    
    if (!email || !industryId) {
      return res.status(400).json({ error: "Email and industry ID are required" });
    }
    
    // Use authenticated user ID if available
    const userId = req.user?.id;
    
    const subscription = await industryTrendsService.subscribeTrendUpdates(email, industryId, userId);
    
    return res.status(201).json(subscription);
  } catch (error: any) {
    console.error("Error subscribing to trend updates:", error);
    return res.status(500).json({ 
      error: "Failed to subscribe to trend updates",
      message: error.message 
    });
  }
}

/**
 * Unsubscribe from trend updates
 */
export async function unsubscribeTrendUpdates(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }
    
    const result = await industryTrendsService.unsubscribeTrendUpdates(parseInt(subscriptionId));
    
    return res.json(result);
  } catch (error: any) {
    console.error("Error unsubscribing from trend updates:", error);
    return res.status(500).json({ 
      error: "Failed to unsubscribe from trend updates",
      message: error.message 
    });
  }
}

/**
 * Get user's recent snapshots
 */
export async function getUserSnapshots(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const snapshots = await industryTrendsService.getUserSnapshots(userId, limit);
    
    return res.json(snapshots);
  } catch (error: any) {
    console.error("Error fetching user snapshots:", error);
    return res.status(500).json({ 
      error: "Failed to fetch user snapshots",
      message: error.message 
    });
  }
}

/**
 * Get a specific snapshot by ID
 */
export async function getSnapshotById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Snapshot ID is required" });
    }
    
    const snapshot = await industryTrendsService.getSnapshotById(parseInt(id));
    
    if (!snapshot) {
      return res.status(404).json({ error: "Snapshot not found" });
    }
    
    return res.json(snapshot);
  } catch (error: any) {
    console.error("Error fetching snapshot:", error);
    return res.status(500).json({ 
      error: "Failed to fetch snapshot",
      message: error.message 
    });
  }
}

/**
 * Share a snapshot by making it public
 */
export async function shareSnapshot(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Snapshot ID is required" });
    }
    
    const snapshot = await industryTrendsService.shareSnapshot(parseInt(id));
    
    return res.json(snapshot);
  } catch (error: any) {
    console.error("Error sharing snapshot:", error);
    return res.status(500).json({ 
      error: "Failed to share snapshot",
      message: error.message 
    });
  }
}

/**
 * Initialize required data for the industry trends feature
 */
export async function initializeTrendsData(_req: Request, res: Response) {
  try {
    // Ensure default template exists
    const template = await industryTrendsService.ensureDefaultTemplateExists();
    
    // Initialize featured industries if needed
    await industryTrendsService.initializeFeaturedIndustries();
    
    return res.json({ 
      success: true, 
      message: "Industry trends data initialized",
      template
    });
  } catch (error: any) {
    console.error("Error initializing trends data:", error);
    return res.status(500).json({ 
      error: "Failed to initialize trends data",
      message: error.message 
    });
  }
}