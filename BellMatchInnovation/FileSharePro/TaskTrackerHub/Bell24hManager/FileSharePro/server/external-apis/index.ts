/**
 * External API client factory
 * This module creates and manages instances of external API clients
 */

import { log } from "../vite.js";
import type { Request, Response } from "express";

// Define the base API client interface
export interface BaseApiClient {
  name: string;
  baseUrl: string;
  isConfigured(): boolean;
  getStatus(): Promise<any>;
}

// Factory for creating API clients
class ApiClientFactory {
  private clients: Map<string, BaseApiClient>;
  
  constructor() {
    this.clients = new Map();
    this.registerBuiltInClients();
  }
  
  // Register the built-in API clients
  private registerBuiltInClients() {
    // These will be implemented in separate modules
    // For now, they are placeholders that check for environment variables
    this.registerClient("kotak", this.createKotakClient());
    this.registerClient("kredx", this.createKredXClient());
    this.registerClient("razorpayx", this.createRazorpayXClient());
    this.registerClient("fsat", this.createFsatClient());
  }
  
  // Register a client with the factory
  registerClient(key: string, client: BaseApiClient) {
    this.clients.set(key, client);
    log(`Registered ${client.name} API client`, "api-client");
  }
  
  // Get a client by key
  getClient(key: string): BaseApiClient | undefined {
    return this.clients.get(key);
  }
  
  // Get all registered clients
  getAllClients(): BaseApiClient[] {
    return Array.from(this.clients.values());
  }
  
  // Initialize all clients
  async initializeClients(): Promise<void> {
    for (const [key, client] of this.clients.entries()) {
      log(`Initializing ${client.name} API client...`, "api-client");
      
      if (client.isConfigured()) {
        log(`${client.name} API client is configured and ready`, "api-client");
      } else {
        log(`${client.name} API client is not configured - some features will be unavailable`, "api-client");
      }
    }
  }
  
  // Simple creation methods for the built-in clients
  
  private createKotakClient(): BaseApiClient {
    return {
      name: "Kotak Securities",
      baseUrl: "https://api.kotaksecurities.com/",
      isConfigured: () => {
        return !!(process.env.KOTAK_SECURITIES_API_KEY && process.env.KOTAK_SECURITIES_API_SECRET);
      },
      getStatus: async () => {
        return {
          configured: this.getClient("kotak")?.isConfigured() || false,
          endpoints: [
            "/api/external/kotak/market-data",
            "/api/external/kotak/orders"
          ]
        };
      }
    };
  }
  
  private createKredXClient(): BaseApiClient {
    return {
      name: "KredX",
      baseUrl: "https://api.kredx.com/",
      isConfigured: () => {
        return !!(process.env.KREDX_API_KEY && process.env.KREDX_API_SECRET);
      },
      getStatus: async () => {
        return {
          configured: this.getClient("kredx")?.isConfigured() || false,
          endpoints: [
            "/api/external/kredx/invoices",
            "/api/external/kredx/vendors"
          ]
        };
      }
    };
  }
  
  private createRazorpayXClient(): BaseApiClient {
    return {
      name: "RazorpayX",
      baseUrl: "https://api.razorpay.com/v1/",
      isConfigured: () => {
        return !!(process.env.RAZORPAYX_API_KEY && process.env.RAZORPAYX_API_SECRET);
      },
      getStatus: async () => {
        return {
          configured: this.getClient("razorpayx")?.isConfigured() || false,
          endpoints: [
            "/api/external/razorpayx/contacts",
            "/api/external/razorpayx/payouts"
          ]
        };
      }
    };
  }
  
  private createFsatClient(): BaseApiClient {
    return {
      name: "FSAT",
      baseUrl: process.env.FSAT_BASE_URL || "https://api.fsat.com/v1/",
      isConfigured: () => {
        return !!(process.env.FSAT_API_KEY && process.env.FSAT_API_SECRET && process.env.FSAT_BASE_URL);
      },
      getStatus: async () => {
        return {
          configured: this.getClient("fsat")?.isConfigured() || false,
          endpoints: [
            "/api/external/fsat/services",
            "/api/external/fsat/orders"
          ]
        };
      }
    };
  }
  
  // Handle common API route patterns
  async handleApiRequest(clientKey: string, req: Request, res: Response): Promise<any> {
    const client = this.getClient(clientKey);
    
    if (!client) {
      return res.status(404).json({
        status: "error",
        message: `API client '${clientKey}' not found`
      });
    }
    
    if (!client.isConfigured()) {
      return res.status(503).json({
        status: "error",
        message: `API client '${clientKey}' is not configured. Missing required environment variables.`,
        requiredSecrets: this.getRequiredSecretsForClient(clientKey)
      });
    }
    
    try {
      // Here we'd implement specific routing logic
      // For now, return a placeholder response
      return res.json({
        status: "success",
        client: client.name,
        message: "API client is ready",
        note: "Actual API integration is not yet implemented"
      });
    } catch (error) {
      console.error(`Error processing ${clientKey} API request:`, error);
      return res.status(500).json({
        status: "error",
        message: `Error processing ${clientKey} API request`,
        error: (error as Error).message
      });
    }
  }
  
  // Get the required secrets for a client
  private getRequiredSecretsForClient(clientKey: string): string[] {
    switch (clientKey) {
      case "kotak":
        return ["KOTAK_SECURITIES_API_KEY", "KOTAK_SECURITIES_API_SECRET"];
      case "kredx":
        return ["KREDX_API_KEY", "KREDX_API_SECRET"];
      case "razorpayx":
        return ["RAZORPAYX_API_KEY", "RAZORPAYX_API_SECRET"];
      case "fsat":
        return ["FSAT_API_KEY", "FSAT_API_SECRET", "FSAT_BASE_URL"];
      default:
        return [];
    }
  }
}

// Create and export a singleton instance
const apiClientFactory = new ApiClientFactory();
export default apiClientFactory;