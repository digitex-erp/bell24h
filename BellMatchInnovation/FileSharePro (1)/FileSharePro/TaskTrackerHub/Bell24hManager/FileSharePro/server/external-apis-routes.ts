/**
 * External API Routes
 * 
 * Simplified routing for external API integration that's compatible
 * with the current project structure.
 */

import express from "express";
import type { Request, Response } from "express";
import { externalApis, handleExternalApiRequest, initializeExternalApis } from "./external-apis-config.js";
import { log } from "./vite.js";

export async function registerExternalApiRoutes(app: express.Express) {
  // Initialize external APIs
  const apiManager = await initializeExternalApis();
  
  // Status endpoint
  app.get("/api/external/status", (req: Request, res: Response) => {
    const status = apiManager.getStatus();
    
    res.json({
      status: "success",
      message: `${status.configured} of ${status.total} external APIs are configured`,
      apis: status.apis
    });
  });
  
  // KOTAK SECURITIES API ROUTES
  app.get("/api/external/kotak/market-data", (req: Request, res: Response) => {
    return handleExternalApiRequest("kotak", req, res);
  });
  
  app.get("/api/external/kotak/orders", (req: Request, res: Response) => {
    return handleExternalApiRequest("kotak", req, res);
  });
  
  // KREDX API ROUTES
  app.get("/api/external/kredx/invoices", (req: Request, res: Response) => {
    return handleExternalApiRequest("kredx", req, res);
  });
  
  app.get("/api/external/kredx/vendors", (req: Request, res: Response) => {
    return handleExternalApiRequest("kredx", req, res);
  });
  
  // RAZORPAYX API ROUTES
  app.get("/api/external/razorpayx/contacts", (req: Request, res: Response) => {
    return handleExternalApiRequest("razorpayx", req, res);
  });
  
  app.get("/api/external/razorpayx/payouts", (req: Request, res: Response) => {
    return handleExternalApiRequest("razorpayx", req, res);
  });
  
  // FSAT API ROUTES
  app.get("/api/external/fsat/services", (req: Request, res: Response) => {
    return handleExternalApiRequest("fsat", req, res);
  });
  
  app.get("/api/external/fsat/orders", (req: Request, res: Response) => {
    return handleExternalApiRequest("fsat", req, res);
  });
  
  log("External API routes registered successfully", "external-api");
}