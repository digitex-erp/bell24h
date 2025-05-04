import { Request, Response } from "express";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { 
  products, 
  subscriptions, 
  users, 
  categories,
  insertProductSchema,
  subscriptionTierEnum
} from "../shared/schema";
import { z } from "zod";
import type { Express } from "express";
import { storage } from "./storage";


// Product listing validation schema with pagination
const getProductsQuerySchema = z.object({
  sellerId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).default('newest'),
});

export interface ShowcaseRoutes {
  // Seller product management
  createProduct: (req: Request, res: Response) => Promise<void>;
  updateProduct: (req: Request, res: Response) => Promise<void>;
  deleteProduct: (req: Request, res: Response) => Promise<void>;
  getSellerProducts: (req: Request, res: Response) => Promise<void>;
  
  // Product showcase (public)
  getProductsByCategory: (req: Request, res: Response) => Promise<void>;
  getProductsBySeller: (req: Request, res: Response) => Promise<void>;
  getProductDetail: (req: Request, res: Response) => Promise<void>;
  
  // Subscription management
  getSubscriptionInfo: (req: Request, res: Response) => Promise<void>;
  updateSubscription: (req: Request, res: Response) => Promise<void>;
}

// Subscription plan limits
const PRODUCT_LIMITS = {
  free: 10,
  basic: 25,
  advanced: 50,
  unlimited: Infinity
};

export async function createShowcaseRoutes(): Promise<ShowcaseRoutes> {
  return {
    // Seller product management
    createProduct: async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user;
        
        // Get user's subscription
        const [subscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id));
        
        // Check if user can add more products
        const [productCount] = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.sellerId, user.id));
        
        // Default to free tier if no subscription exists
        const productLimit = subscription?.productLimit || 10;
        
        if (productCount.count >= productLimit) {
          return res.status(403).json({ 
            message: "Product limit reached. Please upgrade your subscription to add more products." 
          });
        }
        
        // Validate product data
        const productData = insertProductSchema.parse({
          ...req.body,
          sellerId: user.id
        });
        
        // Insert product
        const [newProduct] = await db
          .insert(products)
          .values(productData)
          .returning();
        
        res.status(201).json(newProduct);
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).json({ 
          message: error instanceof z.ZodError 
            ? error.errors 
            : "Failed to create product" 
        });
      }
    },
    
    updateProduct: async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user;
        const productId = parseInt(req.params.id);
        
        // Verify product belongs to user
        const [existingProduct] = await db
          .select()
          .from(products)
          .where(and(
            eq(products.id, productId),
            eq(products.sellerId, user.id)
          ));
        
        if (!existingProduct) {
          return res.status(404).json({ message: "Product not found or not owned by user" });
        }
        
        // Validate update data (exclude sellerId to prevent reassignment)
        const productData = insertProductSchema
          .omit({ sellerId: true })
          .parse(req.body);
        
        // Update product
        const [updatedProduct] = await db
          .update(products)
          .set({
            ...productData,
            updatedAt: new Date()
          })
          .where(eq(products.id, productId))
          .returning();
        
        res.json(updatedProduct);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(400).json({ 
          message: error instanceof z.ZodError 
            ? error.errors 
            : "Failed to update product" 
        });
      }
    },
    
    deleteProduct: async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user;
        const productId = parseInt(req.params.id);
        
        // Verify product belongs to user
        const [existingProduct] = await db
          .select()
          .from(products)
          .where(and(
            eq(products.id, productId),
            eq(products.sellerId, user.id)
          ));
        
        if (!existingProduct) {
          return res.status(404).json({ message: "Product not found or not owned by user" });
        }
        
        // Delete product
        await db
          .delete(products)
          .where(eq(products.id, productId));
        
        res.json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product" });
      }
    },
    
    getSellerProducts: async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user;
        
        // Parse query parameters
        const { page, limit, sort } = getProductsQuerySchema.parse(req.query);
        const offset = (page - 1) * limit;
        
        // Build sort options
        let sortField;
        let sortOrder;
        
        switch (sort) {
          case 'price_asc':
            sortField = products.price;
            sortOrder = 'asc';
            break;
          case 'price_desc':
            sortField = products.price;
            sortOrder = 'desc';
            break;
          case 'oldest':
            sortField = products.createdAt;
            sortOrder = 'asc';
            break;
          case 'newest':
          default:
            sortField = products.createdAt;
            sortOrder = 'desc';
            break;
        }
        
        // Get total count
        const [totalCount] = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.sellerId, user.id));
        
        // Get products with pagination and sorting
        const sellerProducts = await db
          .select()
          .from(products)
          .where(eq(products.sellerId, user.id))
          .orderBy(sortOrder === 'asc' ? sortField : desc(sortField))
          .limit(limit)
          .offset(offset);
        
        // Get subscription info
        const [subscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id));
        
        // Default to free tier if no subscription exists
        const productLimit = subscription?.productLimit || 10;
        
        res.json({
          products: sellerProducts,
          pagination: {
            page,
            limit,
            totalCount: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit),
          },
          quota: {
            used: totalCount.count,
            limit: productLimit,
            remaining: Math.max(0, productLimit - totalCount.count),
          }
        });
      } catch (error) {
        console.error("Error getting seller products:", error);
        res.status(400).json({ 
          message: error instanceof z.ZodError 
            ? error.errors 
            : "Failed to get products" 
        });
      }
    },
    
    // Public routes
    getProductsByCategory: async (req: Request, res: Response) => {
      try {
        const categoryId = parseInt(req.params.categoryId);
        
        // Parse query parameters
        const { page, limit, sort } = getProductsQuerySchema.parse(req.query);
        const offset = (page - 1) * limit;
        
        // Build sort options
        let sortField;
        let sortOrder;
        
        switch (sort) {
          case 'price_asc':
            sortField = products.price;
            sortOrder = 'asc';
            break;
          case 'price_desc':
            sortField = products.price;
            sortOrder = 'desc';
            break;
          case 'oldest':
            sortField = products.createdAt;
            sortOrder = 'asc';
            break;
          case 'newest':
          default:
            sortField = products.createdAt;
            sortOrder = 'desc';
            break;
        }
        
        // Get total count
        const [totalCount] = await db
          .select({ count: count() })
          .from(products)
          .where(and(
            eq(products.categoryId, categoryId),
            eq(products.isVisible, true)
          ));
        
        // Get products with category and seller info
        const categoryProducts = await db
          .select({
            product: products,
            categoryName: categories.name,
            sellerName: users.name,
            companyName: users.company,
          })
          .from(products)
          .where(and(
            eq(products.categoryId, categoryId),
            eq(products.isVisible, true)
          ))
          .innerJoin(categories, eq(products.categoryId, categories.id))
          .innerJoin(users, eq(products.sellerId, users.id))
          .orderBy(sortOrder === 'asc' ? sortField : desc(sortField))
          .limit(limit)
          .offset(offset);
        
        // Get category details
        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId));
        
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        
        res.json({
          category,
          products: categoryProducts,
          pagination: {
            page,
            limit,
            totalCount: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit),
          }
        });
      } catch (error) {
        console.error("Error getting products by category:", error);
        res.status(400).json({ 
          message: error instanceof z.ZodError 
            ? error.errors 
            : "Failed to get products" 
        });
      }
    },
    
    getProductsBySeller: async (req: Request, res: Response) => {
      try {
        const sellerId = parseInt(req.params.sellerId);
        
        // Parse query parameters
        const { page, limit, sort } = getProductsQuerySchema.parse(req.query);
        const offset = (page - 1) * limit;
        
        // Build sort options
        let sortField;
        let sortOrder;
        
        switch (sort) {
          case 'price_asc':
            sortField = products.price;
            sortOrder = 'asc';
            break;
          case 'price_desc':
            sortField = products.price;
            sortOrder = 'desc';
            break;
          case 'oldest':
            sortField = products.createdAt;
            sortOrder = 'asc';
            break;
          case 'newest':
          default:
            sortField = products.createdAt;
            sortOrder = 'desc';
            break;
        }
        
        // Get seller info
        const [seller] = await db
          .select()
          .from(users)
          .where(eq(users.id, sellerId));
        
        if (!seller) {
          return res.status(404).json({ message: "Seller not found" });
        }
        
        // Get total count
        const [totalCount] = await db
          .select({ count: count() })
          .from(products)
          .where(and(
            eq(products.sellerId, sellerId),
            eq(products.isVisible, true)
          ));
        
        // Get seller's products with category info
        const sellerProducts = await db
          .select({
            product: products,
            categoryName: categories.name,
          })
          .from(products)
          .where(and(
            eq(products.sellerId, sellerId),
            eq(products.isVisible, true)
          ))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .orderBy(sortOrder === 'asc' ? sortField : desc(sortField))
          .limit(limit)
          .offset(offset);
        
        // Return seller info and products
        res.json({
          seller: {
            id: seller.id,
            name: seller.name,
            company: seller.company,
            // Don't expose sensitive info like email, password
          },
          products: sellerProducts,
          pagination: {
            page,
            limit,
            totalCount: totalCount.count,
            totalPages: Math.ceil(totalCount.count / limit),
          }
        });
      } catch (error) {
        console.error("Error getting products by seller:", error);
        res.status(400).json({ 
          message: error instanceof z.ZodError 
            ? error.errors 
            : "Failed to get products" 
        });
      }
    },
    
    getProductDetail: async (req: Request, res: Response) => {
      try {
        const productId = parseInt(req.params.id);
        
        // Get product with related information
        const [productDetail] = await db
          .select({
            product: products,
            categoryName: categories.name,
            sellerName: users.name,
            companyName: users.company,
            sellerId: users.id,
          })
          .from(products)
          .where(and(
            eq(products.id, productId),
            eq(products.isVisible, true)
          ))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .innerJoin(users, eq(products.sellerId, users.id));
        
        if (!productDetail) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        // Get other products from same seller (limited to 5)
        const relatedProducts = await db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            images: products.images,
          })
          .from(products)
          .where(and(
            eq(products.sellerId, productDetail.sellerId),
            eq(products.isVisible, true),
            sql`${products.id} != ${productId}`
          ))
          .limit(5);
        
        res.json({
          ...productDetail,
          relatedProducts
        });
      } catch (error) {
        console.error("Error getting product detail:", error);
        res.status(500).json({ message: "Failed to get product detail" });
      }
    },
    
    // Subscription management
    getSubscriptionInfo: async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user;
        
        // Get subscription info
        const [subscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id));
        
        // Get product count
        const [productCount] = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.sellerId, user.id));
        
        // If no subscription exists, user is on free tier
        if (!subscription) {
          return res.json({
            tier: "free",
            productLimit: 10,
            productCount: productCount.count,
            isActive: true,
            autoRenew: false,
            startDate: null,
            endDate: null,
          });
        }
        
        res.json({
          ...subscription,
          productCount: productCount.count,
        });
      } catch (error) {
        console.error("Error getting subscription info:", error);
        res.status(500).json({ message: "Failed to get subscription information" });
      }
    },
    
    updateSubscription: async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = req.user;
        const { tier } = req.body;
        
        // Validate tier
        if (!Object.values(subscriptionTierEnum.enumValues).includes(tier)) {
          return res.status(400).json({ message: "Invalid subscription tier" });
        }
        
        // Set product limit based on tier
        let productLimit: number;
        switch (tier) {
          case 'basic':
            productLimit = 25;
            break;
          case 'advanced':
            productLimit = 50;
            break;
          case 'unlimited':
            productLimit = 999999; // practically unlimited
            break;
          case 'free':
          default:
            productLimit = 10;
            break;
        }
        
        // Check if user already has a subscription
        const [existingSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id));
        
        if (existingSubscription) {
          // Update existing subscription
          const [updatedSubscription] = await db
            .update(subscriptions)
            .set({
              tier,
              productLimit,
              updatedAt: new Date(),
              // Payment processing would happen elsewhere and update
              // stripeCustomerId, stripeSubscriptionId, etc.
            })
            .where(eq(subscriptions.userId, user.id))
            .returning();
          
          return res.json(updatedSubscription);
        } else {
          // Create new subscription
          const [newSubscription] = await db
            .insert(subscriptions)
            .values({
              userId: user.id,
              tier,
              productLimit,
              startDate: new Date(),
              isActive: true,
            })
            .returning();
          
          return res.json(newSubscription);
        }
      } catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({ message: "Failed to update subscription" });
      }
    }
  };
}

export function createShowcaseRoutes(app: Express) {
  // Get supplier's showcase page
  app.get("/api/showcase/:supplierId", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const profile = await storage.getSupplierProfile(supplierId);
      const products = await storage.getShowcaseProducts(supplierId);

      if (!profile) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      res.json({ profile, products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showcase" });
    }
  });

  // Add product to showcase
  app.post("/api/showcase/products", async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const profile = await storage.getSupplierProfile(userId);

      if (!profile) {
        return res.status(403).json({ message: "Only suppliers can add products" });
      }

      const products = await storage.getShowcaseProducts(userId);
      const limit = PRODUCT_LIMITS[profile.subscriptionTier || 'free'];

      if (products.length >= limit) {
        return res.status(403).json({ message: "Product limit reached for your subscription tier" });
      }

      const product = await storage.createShowcaseProduct({
        ...req.body,
        supplierId: userId
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to add product" });
    }
  });

  // Update product
  app.put("/api/showcase/products/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = (req.user as any).id;

      const product = await storage.getShowcaseProduct(productId);
      if (!product || product.supplierId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this product" });
      }

      const updatedProduct = await storage.updateShowcaseProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/showcase/products/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = (req.user as any).id;

      const product = await storage.getShowcaseProduct(productId);
      if (!product || product.supplierId !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this product" });
      }

      await storage.deleteShowcaseProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
}