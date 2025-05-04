/**
 * External API Configuration
 * 
 * This file provides a simplified approach to external API integration
 * that's compatible with the current project structure.
 */

import { log } from "./vite.js";

export interface ExternalApiConfig {
  name: string;
  baseUrl: string;
  isConfigured: () => boolean;
  requiredEnvVars: string[];
  endpoints: string[];
}

// Define the external API configurations
export const externalApis: Record<string, ExternalApiConfig> = {
  kotak: {
    name: "Kotak Securities",
    baseUrl: "https://api.kotaksecurities.com/",
    isConfigured: () => {
      return !!(process.env.KOTAK_SECURITIES_API_KEY && process.env.KOTAK_SECURITIES_API_SECRET);
    },
    requiredEnvVars: ["KOTAK_SECURITIES_API_KEY", "KOTAK_SECURITIES_API_SECRET"],
    endpoints: ["/api/external/kotak/market-data", "/api/external/kotak/orders"]
  },
  
  kredx: {
    name: "KredX",
    baseUrl: "https://api.kredx.com/",
    isConfigured: () => {
      return !!(process.env.KREDX_API_KEY && process.env.KREDX_API_SECRET);
    },
    requiredEnvVars: ["KREDX_API_KEY", "KREDX_API_SECRET"],
    endpoints: ["/api/external/kredx/invoices", "/api/external/kredx/vendors"]
  },
  
  razorpayx: {
    name: "RazorpayX",
    baseUrl: "https://api.razorpay.com/v1/",
    isConfigured: () => {
      return !!(process.env.RAZORPAYX_API_KEY && process.env.RAZORPAYX_API_SECRET);
    },
    requiredEnvVars: ["RAZORPAYX_API_KEY", "RAZORPAYX_API_SECRET"],
    endpoints: ["/api/external/razorpayx/contacts", "/api/external/razorpayx/payouts"]
  },
  
  fsat: {
    name: "FSAT",
    baseUrl: process.env.FSAT_BASE_URL || "https://api.fsat.com/v1/",
    isConfigured: () => {
      return !!(process.env.FSAT_API_KEY && process.env.FSAT_API_SECRET && process.env.FSAT_BASE_URL);
    },
    requiredEnvVars: ["FSAT_API_KEY", "FSAT_API_SECRET", "FSAT_BASE_URL"],
    endpoints: ["/api/external/fsat/services", "/api/external/fsat/orders"]
  }
};

/**
 * Initialize external API clients
 * Logs the configuration status
 */
export async function initializeExternalApis() {
  log("Initializing external API integrations...");
  
  for (const [key, api] of Object.entries(externalApis)) {
    if (api.isConfigured()) {
      log(`${api.name} API is configured and ready to use`, "external-api");
    } else {
      log(`${api.name} API is not configured - some features will be unavailable`, "external-api");
    }
  }
  
  return {
    getStatus: () => {
      const status = Object.entries(externalApis).map(([key, api]) => {
        return {
          name: api.name,
          configured: api.isConfigured(),
          endpoints: api.endpoints
        };
      });
      
      return {
        total: status.length,
        configured: status.filter(api => api.configured).length,
        apis: status
      };
    }
  };
}

/**
 * Handle an API request with appropriate error handling
 */
export async function handleExternalApiRequest(apiKey: string, req: any, res: any) {
  const api = externalApis[apiKey];
  
  if (!api) {
    return res.status(404).json({
      status: "error",
      message: `API '${apiKey}' not found`
    });
  }
  
  if (!api.isConfigured()) {
    return res.status(503).json({
      status: "error",
      message: `${api.name} API is not configured. Missing required environment variables.`,
      required: api.requiredEnvVars
    });
  }
  
  try {
    // Here we'd implement specific API client logic
    // For now, return placeholder data
    return res.json({
      status: "success",
      api: api.name,
      message: "The API is configured correctly",
      note: "This is a placeholder response. Actual API integration will be implemented in later phases."
    });
  } catch (error) {
    console.error(`Error processing ${api.name} request:`, error);
    return res.status(500).json({
      status: "error",
      message: `Error processing ${api.name} request`,
      error: (error as Error).message
    });
  }
}