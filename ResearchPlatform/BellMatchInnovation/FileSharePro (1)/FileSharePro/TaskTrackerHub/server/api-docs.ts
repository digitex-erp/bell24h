import { Express, Request, Response } from "express";
import { log } from "./vite";

/**
 * API Documentation Generator
 * 
 * Generates comprehensive API documentation for the Bell24h.com B2B marketplace.
 * Accessible through /api/docs endpoint.
 */

/**
 * Register API documentation routes
 * @param app Express application
 */
export function registerApiDocs(app: Express): void {
  log("API documentation routes registered", "api-docs");
  
  // API documentation home
  app.get("/api/docs", (req: Request, res: Response) => {
    res.status(200).json({
      title: "Bell24h.com B2B Marketplace API Documentation",
      version: "1.0.0",
      description: "API documentation for the Bell24h.com B2B marketplace platform, providing access to procurement, supplier matching, and blockchain features.",
      baseUrl: `${req.protocol}://${req.get("host")}/api`,
      endpoints: [
        "/docs",
        "/docs/auth",
        "/docs/rfqs",
        "/docs/quotes",
        "/docs/suppliers",
        "/docs/payments",
        "/docs/shipments",
        "/docs/blockchain",
        "/docs/gst",
        "/docs/market",
        "/docs/ai"
      ]
    });
  });
  
  // Authentication API docs
  app.get("/api/docs/auth", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Authentication",
      description: "Authentication and user management APIs",
      baseUrl: `${req.protocol}://${req.get("host")}/api/auth`,
      endpoints: [
        {
          path: "/login",
          method: "POST",
          description: "Authenticate a user and create a session",
          requestBody: {
            username: "string",
            password: "string"
          },
          responses: {
            200: {
              description: "Login successful",
              schema: {
                id: "number",
                username: "string",
                fullName: "string",
                email: "string",
                company: "string",
                role: "string"
              }
            },
            401: { description: "Invalid credentials" }
          }
        },
        {
          path: "/register",
          method: "POST",
          description: "Register a new user account",
          requestBody: {
            username: "string",
            password: "string",
            fullName: "string",
            email: "string",
            company: "string",
            role: "string (buyer/supplier)"
          },
          responses: {
            201: { description: "Account created successfully" },
            400: { description: "Invalid registration data" }
          }
        },
        {
          path: "/current",
          method: "GET",
          description: "Get the current authenticated user",
          responses: {
            200: {
              description: "Current user",
              schema: {
                id: "number",
                username: "string",
                fullName: "string",
                email: "string",
                company: "string",
                role: "string"
              }
            },
            401: { description: "Not authenticated" }
          }
        },
        {
          path: "/logout",
          method: "POST",
          description: "Log out the current user and destroy session",
          responses: {
            200: { description: "Logout successful" }
          }
        }
      ]
    });
  });
  
  // RFQ API docs
  app.get("/api/docs/rfqs", (req: Request, res: Response) => {
    res.status(200).json({
      category: "RFQs (Request for Quotations)",
      description: "APIs for creating and managing RFQs",
      baseUrl: `${req.protocol}://${req.get("host")}/api/rfqs`,
      endpoints: [
        {
          path: "/",
          method: "GET",
          description: "Get all RFQs or filtered by query parameters",
          queryParams: {
            userId: "number (optional)",
            status: "string (optional, open/closed/awarded)",
            limit: "number (optional)"
          },
          responses: {
            200: {
              description: "List of RFQs",
              schema: [{
                id: "number",
                rfqNumber: "string",
                product: "string",
                quantity: "string",
                status: "string",
                dueDate: "string (ISO date)",
                userId: "number",
                description: "string",
                successRate: "number"
              }]
            }
          }
        },
        {
          path: "/:id",
          method: "GET",
          description: "Get a specific RFQ by ID",
          params: {
            id: "number (required)"
          },
          responses: {
            200: {
              description: "RFQ details",
              schema: {
                id: "number",
                rfqNumber: "string",
                product: "string",
                quantity: "string",
                status: "string",
                dueDate: "string (ISO date)",
                userId: "number",
                description: "string",
                successRate: "number",
                videoUrl: "string",
                category: "string",
                location: "string",
                budget: "string",
                deliveryDeadline: "string",
                requiredCertifications: "string"
              }
            },
            404: { description: "RFQ not found" }
          }
        },
        {
          path: "/",
          method: "POST",
          description: "Create a new RFQ",
          requestBody: {
            rfqNumber: "string",
            product: "string",
            quantity: "string",
            status: "string",
            dueDate: "string (ISO date)",
            description: "string",
            videoUrl: "string (optional)",
            category: "string (optional)",
            location: "string (optional)",
            budget: "string (optional)",
            deliveryDeadline: "string (optional)",
            requiredCertifications: "string (optional)"
          },
          responses: {
            201: { description: "RFQ created successfully" },
            400: { description: "Invalid RFQ data" }
          }
        }
      ]
    });
  });
  
  // Quote API docs
  app.get("/api/docs/quotes", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Quotes",
      description: "APIs for submitting and managing quotes in response to RFQs",
      baseUrl: `${req.protocol}://${req.get("host")}/api/quotes`,
      endpoints: [
        {
          path: "/rfq/:rfqId",
          method: "GET",
          description: "Get all quotes for a specific RFQ",
          params: {
            rfqId: "number (required)"
          },
          responses: {
            200: {
              description: "List of quotes",
              schema: [{
                id: "number",
                price: "string",
                deliveryTime: "string",
                specifications: "string",
                rfqId: "number",
                supplierId: "number",
                status: "string",
                createdAt: "string (ISO date)"
              }]
            }
          }
        },
        {
          path: "/",
          method: "POST",
          description: "Submit a new quote for an RFQ",
          requestBody: {
            rfqId: "number",
            supplierId: "number",
            price: "string",
            deliveryTime: "string",
            specifications: "string",
            status: "string"
          },
          responses: {
            201: { description: "Quote submitted successfully" },
            400: { description: "Invalid quote data" }
          }
        }
      ]
    });
  });
  
  // Supplier API docs
  app.get("/api/docs/suppliers", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Suppliers",
      description: "APIs for managing suppliers and supplier recommendations",
      baseUrl: `${req.protocol}://${req.get("host")}/api`,
      endpoints: [
        {
          path: "/suppliers",
          method: "GET",
          description: "Get all suppliers",
          responses: {
            200: {
              description: "List of suppliers",
              schema: [{
                id: "number",
                name: "string",
                location: "string",
                category: "string",
                contactPerson: "string",
                contactEmail: "string",
                contactPhone: "string",
                riskScore: "number",
                successRate: "number"
              }]
            }
          }
        },
        {
          path: "/suppliers/:id",
          method: "GET",
          description: "Get a specific supplier by ID",
          params: {
            id: "number (required)"
          },
          responses: {
            200: {
              description: "Supplier details",
              schema: {
                id: "number",
                name: "string",
                location: "string",
                category: "string",
                contactPerson: "string",
                contactEmail: "string",
                contactPhone: "string",
                riskScore: "number",
                successRate: "number",
                certifications: "string",
                priceRange: "string",
                averageDeliveryTime: "string"
              }
            },
            404: { description: "Supplier not found" }
          }
        },
        {
          path: "/suppliers",
          method: "POST",
          description: "Create a new supplier",
          requestBody: {
            name: "string",
            location: "string",
            category: "string",
            contactPerson: "string",
            contactEmail: "string",
            contactPhone: "string"
          },
          responses: {
            201: { description: "Supplier created successfully" },
            400: { description: "Invalid supplier data" }
          }
        },
        {
          path: "/supplier-recommendations/:rfqId",
          method: "GET",
          description: "Get AI-powered supplier recommendations for an RFQ",
          params: {
            rfqId: "number (required)"
          },
          queryParams: {
            refresh: "boolean (optional, force refresh recommendations)"
          },
          responses: {
            200: {
              description: "List of supplier recommendations",
              schema: [{
                id: "number",
                rfqId: "number",
                supplierId: "number",
                matchScore: "number",
                matchReason: "string",
                recommended: "boolean"
              }]
            }
          }
        },
        {
          path: "/supplier-recommendations",
          method: "POST",
          description: "Generate or create supplier recommendations",
          requestBody: {
            generate: "boolean (optional, set to true to use AI algorithm)",
            rfqId: "number (required for generate=true)",
            limit: "number (optional, max recommendations to generate)",
            // For manual creation:
            supplierId: "number",
            matchScore: "number",
            matchReason: "string",
            recommended: "boolean"
          },
          responses: {
            200: { description: "Recommendations generated successfully" },
            201: { description: "Recommendation created successfully" },
            400: { description: "Invalid recommendation data" }
          }
        }
      ]
    });
  });
  
  // Payment API docs
  app.get("/api/docs/payments", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Payments",
      description: "APIs for managing payments, escrow, and invoice discounting",
      baseUrl: `${req.protocol}://${req.get("host")}/api`,
      endpoints: [
        {
          path: "/payments",
          method: "GET",
          description: "Get all payments for the current user",
          responses: {
            200: {
              description: "List of payments",
              schema: [{
                id: "number",
                amount: "string",
                status: "string",
                type: "string",
                createdAt: "string (ISO date)",
                rfqId: "number",
                supplierId: "number"
              }]
            }
          }
        },
        {
          path: "/wallet",
          method: "GET",
          description: "Get the current user's wallet balance",
          responses: {
            200: {
              description: "Wallet balance",
              schema: {
                balance: "string",
                currency: "string"
              }
            },
            401: { description: "Not authenticated" }
          }
        },
        {
          path: "/payments/milestone",
          method: "POST",
          description: "Create a milestone-based payment",
          requestBody: {
            rfqId: "number",
            supplierId: "number",
            amount: "string",
            milestoneNumber: "number",
            totalMilestones: "number",
            description: "string"
          },
          responses: {
            201: { description: "Payment created successfully" },
            400: { description: "Invalid payment data" }
          }
        },
        {
          path: "/payments/invoice-discount",
          method: "POST",
          description: "Request invoice discounting",
          requestBody: {
            invoiceNumber: "string",
            amount: "string",
            dueDate: "string (ISO date)",
            supplierId: "number"
          },
          responses: {
            201: { description: "Invoice discount request created" },
            400: { description: "Invalid invoice data" }
          }
        }
      ]
    });
  });
  
  // Shipment API docs
  app.get("/api/docs/shipments", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Shipments",
      description: "APIs for managing and tracking shipments",
      baseUrl: `${req.protocol}://${req.get("host")}/api/shipments`,
      endpoints: [
        {
          path: "/",
          method: "GET",
          description: "Get all shipments for the current user",
          responses: {
            200: {
              description: "List of shipments",
              schema: [{
                id: "number",
                trackingNumber: "string",
                carrier: "string",
                status: "string",
                trackingProgress: "number",
                estimatedDelivery: "string (ISO date)",
                rfqId: "number",
                createdAt: "string (ISO date)"
              }]
            }
          }
        },
        {
          path: "/:id",
          method: "GET",
          description: "Get a specific shipment by ID",
          params: {
            id: "number (required)"
          },
          responses: {
            200: {
              description: "Shipment details",
              schema: {
                id: "number",
                trackingNumber: "string",
                carrier: "string",
                status: "string",
                trackingProgress: "number",
                estimatedDelivery: "string (ISO date)",
                rfqId: "number",
                origin: "string",
                destination: "string",
                items: "string",
                weight: "string",
                dimensions: "string",
                createdAt: "string (ISO date)"
              }
            },
            404: { description: "Shipment not found" }
          }
        },
        {
          path: "/",
          method: "POST",
          description: "Create a new shipment",
          requestBody: {
            trackingNumber: "string",
            carrier: "string",
            status: "string",
            estimatedDelivery: "string (ISO date)",
            rfqId: "number",
            origin: "string",
            destination: "string",
            items: "string",
            weight: "string",
            dimensions: "string"
          },
          responses: {
            201: { description: "Shipment created successfully" },
            400: { description: "Invalid shipment data" }
          }
        }
      ]
    });
  });
  
  // Blockchain API docs
  app.get("/api/docs/blockchain", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Blockchain",
      description: "APIs for blockchain integration, document verification, and smart contracts",
      baseUrl: `${req.protocol}://${req.get("host")}/api/blockchain`,
      endpoints: [
        {
          path: "/token-balance",
          method: "GET",
          description: "Get the user's Bell24 token balance",
          responses: {
            200: {
              description: "Token balance",
              schema: {
                balance: "string",
                symbol: "string"
              }
            },
            401: { description: "Not authenticated" },
            400: { description: "User wallet not set up" }
          }
        },
        {
          path: "/create-rfq",
          method: "POST",
          description: "Create an RFQ on the blockchain",
          requestBody: {
            rfqNumber: "string",
            product: "string",
            quantity: "string",
            dueDate: "string (ISO date)",
            description: "string",
            documentHash: "string (optional)"
          },
          responses: {
            200: {
              description: "RFQ created on blockchain",
              schema: {
                txHash: "string",
                blockNumber: "number",
                success: "boolean"
              }
            },
            500: { description: "Blockchain transaction failed" }
          }
        },
        {
          path: "/submit-quote",
          method: "POST",
          description: "Submit a quote on the blockchain",
          requestBody: {
            rfqId: "number",
            price: "string",
            deliveryTime: "string",
            documentHash: "string (optional)"
          },
          responses: {
            200: {
              description: "Quote submitted on blockchain",
              schema: {
                txHash: "string",
                blockNumber: "number",
                success: "boolean"
              }
            },
            500: { description: "Blockchain transaction failed" }
          }
        },
        {
          path: "/create-payment",
          method: "POST",
          description: "Create a payment on the blockchain",
          requestBody: {
            rfqId: "number",
            supplier: "string (address)",
            amount: "string",
            paymentType: "string (full/milestone)",
            milestoneNumber: "number (optional)",
            totalMilestones: "number (optional)",
            documentHash: "string (optional)"
          },
          responses: {
            200: {
              description: "Payment created on blockchain",
              schema: {
                txHash: "string",
                blockNumber: "number",
                success: "boolean"
              }
            },
            500: { description: "Blockchain transaction failed" }
          }
        },
        {
          path: "/store-document",
          method: "POST",
          description: "Store a document hash on blockchain and content on IPFS",
          requestBody: {
            content: "string",
            referenceId: "number",
            documentType: "string (rfq/quote/shipment/payment/dispute/other)",
            description: "string"
          },
          responses: {
            200: {
              description: "Document stored successfully",
              schema: {
                contentHash: "string",
                ipfsHash: "string",
                ipfsUrl: "string",
                txHash: "string",
                success: "boolean"
              }
            },
            500: { description: "Document storage failed" }
          }
        },
        {
          path: "/verify-document",
          method: "POST",
          description: "Verify a document's authenticity on the blockchain",
          requestBody: {
            contentHash: "string"
          },
          responses: {
            200: {
              description: "Document verification result",
              schema: {
                verified: "boolean",
                exists: "boolean",
                timestamp: "number",
                documentType: "number",
                referenceId: "number",
                ipfsHash: "string",
                creator: "string (address)"
              }
            }
          }
        },
        {
          path: "/check-document/:contentHash",
          method: "GET",
          description: "Check a document's existence and fetch its content",
          params: {
            contentHash: "string (required)"
          },
          responses: {
            200: {
              description: "Document check result with content if available",
              schema: {
                exists: "boolean",
                verified: "boolean",
                ipfsHash: "string",
                content: "string",
                ipfsUrl: "string",
                success: "boolean"
              }
            }
          }
        }
      ]
    });
  });
  
  // GST Validation API docs
  app.get("/api/docs/gst", (req: Request, res: Response) => {
    res.status(200).json({
      category: "GST Validation",
      description: "APIs for validating Indian GST numbers and business details",
      baseUrl: `${req.protocol}://${req.get("host")}/api`,
      endpoints: [
        {
          path: "/validate/gst",
          method: "POST",
          description: "Validate a GST number",
          requestBody: {
            gstNumber: "string"
          },
          responses: {
            200: {
              description: "GST validation result (valid)",
              schema: {
                valid: "boolean",
                businessName: "string",
                address: "string",
                status: "string"
              }
            },
            400: {
              description: "GST validation result (invalid)",
              schema: {
                valid: "boolean",
                error: "string"
              }
            }
          }
        },
        {
          path: "/business-details/gst/:gstNumber",
          method: "GET",
          description: "Get business details by GST number",
          params: {
            gstNumber: "string (required)"
          },
          responses: {
            200: {
              description: "Business details by GST (success)",
              schema: {
                success: "boolean",
                businessName: "string",
                address: "string",
                state: "string",
                businessType: "string",
                registrationDate: "string",
                status: "string"
              }
            },
            400: {
              description: "Business details result (failure)",
              schema: {
                success: "boolean",
                error: "string"
              }
            }
          }
        },
        {
          path: "/verify/business-match",
          method: "POST",
          description: "Verify match between provided business info and GST records",
          requestBody: {
            gstNumber: "string",
            businessName: "string",
            state: "string (optional)"
          },
          responses: {
            200: {
              description: "Business match verification result",
              schema: {
                match: "boolean",
                confidence: "number",
                message: "string"
              }
            },
            400: { description: "Invalid verification request" }
          }
        }
      ]
    });
  });
  
  // Market & Stock API docs
  app.get("/api/docs/market", (req: Request, res: Response) => {
    res.status(200).json({
      category: "Market & Stock APIs",
      description: "APIs for market trends and stock data",
      baseUrl: `${req.protocol}://${req.get("host")}/api`,
      endpoints: [
        {
          path: "/market-trends",
          method: "GET",
          description: "Get market trends data for all sectors or a specific sector",
          queryParams: {
            sector: "string (optional, if provided returns data for specific sector)"
          },
          responses: {
            200: {
              description: "Market trends data",
              schema: {
                id: "number",
                sector: "string",
                data: "object",
                insights: "string",
                lastUpdated: "string (ISO date)"
              }
            }
          }
        },
        {
          path: "/stock/:symbol",
          method: "GET",
          description: "Get stock market data for a specific symbol",
          params: {
            symbol: "string (required, stock symbol e.g. RELIANCE.BSE)"
          },
          responses: {
            200: {
              description: "Stock data",
              schema: {
                symbol: "string",
                name: "string",
                price: "number",
                change: "number",
                percentChange: "number",
                volume: "number",
                dayHigh: "number",
                dayLow: "number",
                marketCap: "number",
                lastUpdated: "string (ISO date)"
              }
            },
            500: { description: "Error fetching stock data" }
          }
        }
      ]
    });
  });
  
  // AI Feature API docs
  app.get("/api/docs/ai", (req: Request, res: Response) => {
    res.status(200).json({
      category: "AI Features",
      description: "APIs for AI-powered features like supplier matching and bid prediction",
      baseUrl: `${req.protocol}://${req.get("host")}/api`,
      endpoints: [
        {
          path: "/supplier-recommendations/:rfqId",
          method: "GET",
          description: "Get AI-powered supplier recommendations for an RFQ",
          params: {
            rfqId: "number (required)"
          },
          queryParams: {
            refresh: "boolean (optional, force refresh recommendations)"
          },
          responses: {
            200: {
              description: "List of supplier recommendations",
              schema: [{
                id: "number",
                rfqId: "number",
                supplierId: "number",
                matchScore: "number",
                matchReason: "string",
                recommended: "boolean"
              }]
            }
          }
        },
        {
          path: "/bid-prediction/:rfqId",
          method: "GET",
          description: "Get AI-powered bid price prediction for an RFQ",
          params: {
            rfqId: "number (required)"
          },
          responses: {
            200: {
              description: "Bid price prediction",
              schema: {
                minPrice: "number",
                maxPrice: "number",
                avgPrice: "number",
                confidence: "number",
                explanation: "string",
                factors: {
                  marketTrend: "number",
                  historicalPrices: "number",
                  supplierReputation: "number",
                  complexity: "number",
                  urgency: "number"
                }
              }
            },
            404: { description: "RFQ not found" }
          }
        },
        {
          path: "/detect-price-anomaly",
          method: "POST",
          description: "Detect anomalies in a quote price",
          requestBody: {
            quoteId: "number"
          },
          responses: {
            200: {
              description: "Price anomaly detection result",
              schema: {
                isAnomaly: "boolean",
                anomalyScore: "number",
                recommendedPrice: "number",
                explanation: "string"
              }
            },
            404: { description: "Quote, RFQ, or supplier not found" }
          }
        }
      ]
    });
  });
}