/**
 * External API routes
 * This module defines routes for accessing external APIs
 */

import express, { Router, Request, Response } from "express";
import apiClientFactory from "./index.js";
import { log } from "../vite.js";

// Create a router for external API routes
const router = express.Router();

// API Status endpoint
router.get("/status", async (req: Request, res: Response) => {
  try {
    const clients = apiClientFactory.getAllClients();
    const clientStatuses = await Promise.all(
      clients.map(async client => {
        return {
          name: client.name,
          configured: client.isConfigured(),
          status: client.isConfigured() ? "ready" : "not configured"
        };
      })
    );
    
    const configuredClientsCount = clientStatuses.filter(c => c.configured).length;
    
    res.json({
      status: "success",
      message: `${configuredClientsCount} of ${clientStatuses.length} external APIs are configured`,
      apis: clientStatuses
    });
  } catch (error) {
    log(`Error fetching external API status: ${(error as Error).message}`, "api-routes");
    res.status(500).json({
      status: "error",
      message: "Failed to fetch external API status",
      error: (error as Error).message
    });
  }
});

// KOTAK SECURITIES API ROUTES
router.get("/kotak/market-data", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("kotak", req, res);
});

router.get("/kotak/orders", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("kotak", req, res);
});

// KREDX API ROUTES
router.get("/kredx/invoices", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("kredx", req, res);
});

router.get("/kredx/vendors", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("kredx", req, res);
});

// RAZORPAYX API ROUTES
router.get("/razorpayx/contacts", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("razorpayx", req, res);
});

router.get("/razorpayx/payouts", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("razorpayx", req, res);
});

// FSAT API ROUTES
router.get("/fsat/services", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("fsat", req, res);
});

router.get("/fsat/orders", async (req: Request, res: Response) => {
  return apiClientFactory.handleApiRequest("fsat", req, res);
});

// Export the router
export default router;