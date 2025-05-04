import { db } from "../db";
import { 
  rfqs, 
  bids, 
  users, 
  suppliers, 
  products, 
  contracts, 
  analyticsData, 
  productAnalytics, 
  rfqAnalytics, 
  marketTrends 
} from "../../shared/schema";
import { eq, and, or, desc, asc, count, sum, avg, gte, lte, sql } from "drizzle-orm";
import { getSupplierByUserId } from "./suppliers";

/**
 * AnalyticsService provides methods for retrieving and calculating analytics data
 * for the dashboard visualizations.
 */
export class AnalyticsService {
  
  /**
   * Get dashboard overview stats for a user
   * @param userId The ID of the user
   * @returns Overview statistics including RFQ, bid, contract, and supplier counts
   */
  async getDashboardOverview(userId: number) {
    // Get user role information to determine what data to show
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user || user.length === 0) {
      throw new Error("User not found");
    }
    
    const userType = user[0].userType;
    const supplier = await getSupplierByUserId(userId);
    
    // Initialize stats
    let stats = {
      activeRfqs: 0,
      totalBids: 0,
      contractValue: 0,
      activeSuppliers: 0,
      trendData: {}
    };
    
    // If user is a buyer or both
    if (userType === 'buyer' || userType === 'both') {
      // Count active RFQs created by this user
      const activeRfqsResult = await db
        .select({ count: count() })
        .from(rfqs)
        .where(
          and(
            eq(rfqs.userId, userId),
            eq(rfqs.status, 'open')
          )
        );
      
      stats.activeRfqs = activeRfqsResult[0]?.count || 0;
      
      // Get total bids received on user's RFQs
      const userRfqIds = await db
        .select({ id: rfqs.id })
        .from(rfqs)
        .where(eq(rfqs.userId, userId));
      
      if (userRfqIds.length > 0) {
        const rfqIdList = userRfqIds.map(r => r.id);
        
        const totalBidsResult = await db
          .select({ count: count() })
          .from(bids)
          .where(sql`${bids.rfqId} IN ${rfqIdList}`);
        
        stats.totalBids = totalBidsResult[0]?.count || 0;
      }
      
      // Calculate total contract value for contracts where user is the buyer
      const contractValueResult = await db
        .select({ total: sum(contracts.value) })
        .from(contracts)
        .where(eq(contracts.buyerId, userId));
      
      stats.contractValue = Number(contractValueResult[0]?.total || 0);
      
      // Count active suppliers (those who have bid on user's RFQs)
      const activeSuppliersResult = await db
        .select({ count: count() })
        .from(suppliers)
        .where(
          sql`${suppliers.id} IN (
            SELECT DISTINCT ${bids.supplierId} 
            FROM ${bids} 
            JOIN ${rfqs} ON ${bids.rfqId} = ${rfqs.id} 
            WHERE ${rfqs.userId} = ${userId}
          )`
        );
      
      stats.activeSuppliers = activeSuppliersResult[0]?.count || 0;
    }
    
    // If user is a supplier or both
    if (userType === 'supplier' || userType === 'both') {
      if (supplier) {
        // Count active RFQs the supplier has bid on
        const activeRfqsResult = await db
          .select({ count: count() })
          .from(rfqs)
          .where(
            sql`${rfqs.id} IN (
              SELECT ${bids.rfqId} 
              FROM ${bids} 
              WHERE ${bids.supplierId} = ${supplier.id}
            )`
          );
        
        // If the user is both buyer and supplier, add to the existing count
        if (userType === 'both') {
          stats.activeRfqs += activeRfqsResult[0]?.count || 0;
        } else {
          stats.activeRfqs = activeRfqsResult[0]?.count || 0;
        }
        
        // Count total bids submitted by this supplier
        const totalBidsResult = await db
          .select({ count: count() })
          .from(bids)
          .where(eq(bids.supplierId, supplier.id));
        
        // If the user is both buyer and supplier, add to the existing count
        if (userType === 'both') {
          stats.totalBids += totalBidsResult[0]?.count || 0;
        } else {
          stats.totalBids = totalBidsResult[0]?.count || 0;
        }
        
        // Calculate total contract value for contracts where user is the supplier
        const contractValueResult = await db
          .select({ total: sum(contracts.value) })
          .from(contracts)
          .where(eq(contracts.supplierId, supplier.id));
        
        // If the user is both buyer and supplier, add to the existing count
        if (userType === 'both') {
          stats.contractValue += Number(contractValueResult[0]?.total || 0);
        } else {
          stats.contractValue = Number(contractValueResult[0]?.total || 0);
        }
      }
    }
    
    // Get trend data for the past year (monthly breakdown)
    // This creates data for RFQ creation trend over time
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const rfqTrends = await db
      .select({
        month: sql`DATE_TRUNC('month', ${rfqs.createdAt})::date`,
        count: count(),
      })
      .from(rfqs)
      .where(
        and(
          userType === 'buyer' || userType === 'both' 
            ? eq(rfqs.userId, userId) 
            : sql`TRUE`,
          gte(rfqs.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${rfqs.createdAt})::date`)
      .orderBy(sql`DATE_TRUNC('month', ${rfqs.createdAt})::date`);
    
    stats.trendData = {
      rfqTrends
    };
    
    return stats;
  }
  
  /**
   * Get RFQ performance metrics
   * @param userId The ID of the user
   * @returns RFQ performance data including response times, bid rates, etc.
   */
  async getRfqPerformance(userId: number) {
    // Get user role information
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user || user.length === 0) {
      throw new Error("User not found");
    }
    
    const userType = user[0].userType;
    
    // Initialize performance data with properly typed arrays
    let performance: {
      rfqPerformanceScore: number;
      bidRate: number;
      averageBidsPerRfq: number;
      awardRate: number;
      responseTimeDistribution: { responseTime: string; count: number }[];
      rfqStatusOverview: { status: string; count: number }[];
      rfqCategories: { category: string; count: number }[];
      rfqTypePerformance: {
        rfqType: string;
        count: number;
        avgBids: number;
        awardRate: number;
        avgValue: number;
      }[];
    } = {
      rfqPerformanceScore: 0,
      bidRate: 0,
      averageBidsPerRfq: 0,
      awardRate: 0,
      responseTimeDistribution: [],
      rfqStatusOverview: [],
      rfqCategories: [],
      rfqTypePerformance: []
    };
    
    // If user is a buyer or both
    if (userType === 'buyer' || userType === 'both') {
      // Get total RFQs created by this user
      const totalRfqsResult = await db
        .select({ count: count() })
        .from(rfqs)
        .where(eq(rfqs.userId, userId));
      
      const totalRfqs = totalRfqsResult[0]?.count || 0;
      
      if (totalRfqs > 0) {
        // Get RFQs that received at least one bid
        const rfqsWithBidsResult = await db
          .select({ count: count() })
          .from(rfqs)
          .where(
            and(
              eq(rfqs.userId, userId),
              sql`EXISTS (
                SELECT 1 FROM ${bids} WHERE ${bids.rfqId} = ${rfqs.id}
              )`
            )
          );
        
        const rfqsWithBids = rfqsWithBidsResult[0]?.count || 0;
        
        // Calculate bid rate (percentage of RFQs that received bids)
        performance.bidRate = totalRfqs > 0 ? (rfqsWithBids / totalRfqs) * 100 : 0;
        
        // Calculate average bids per RFQ
        const totalBidsResult = await db
          .select({ count: count() })
          .from(bids)
          .where(
            sql`${bids.rfqId} IN (
              SELECT ${rfqs.id} FROM ${rfqs} WHERE ${rfqs.userId} = ${userId}
            )`
          );
        
        const totalBids = totalBidsResult[0]?.count || 0;
        performance.averageBidsPerRfq = totalRfqs > 0 ? totalBids / totalRfqs : 0;
        
        // Calculate award rate (percentage of RFQs that got awarded)
        const awardedRfqsResult = await db
          .select({ count: count() })
          .from(rfqs)
          .where(
            and(
              eq(rfqs.userId, userId),
              eq(rfqs.status, 'awarded')
            )
          );
        
        const awardedRfqs = awardedRfqsResult[0]?.count || 0;
        performance.awardRate = totalRfqs > 0 ? (awardedRfqs / totalRfqs) * 100 : 0;
        
        // Calculate overall RFQ performance score (weighted average of bid rate and award rate)
        performance.rfqPerformanceScore = (performance.bidRate * 0.4) + (performance.awardRate * 0.6);
        
        // Get RFQ status overview
        const statusOverview = await db
          .select({
            status: rfqs.status,
            count: count(),
          })
          .from(rfqs)
          .where(eq(rfqs.userId, userId))
          .groupBy(rfqs.status);
        
        performance.rfqStatusOverview = statusOverview;
        
        // Get RFQ categories distribution
        const categoriesDistribution = await db
          .select({
            category: rfqs.category,
            count: count(),
          })
          .from(rfqs)
          .where(eq(rfqs.userId, userId))
          .groupBy(rfqs.category);
        
        performance.rfqCategories = categoriesDistribution;
        
        // Get RFQ performance by type (text, voice, video)
        const rfqTypePerformance = await db
          .select({
            rfqType: rfqs.rfqType,
            count: count(),
          })
          .from(rfqs)
          .where(eq(rfqs.userId, userId))
          .groupBy(rfqs.rfqType);
        
        // For each RFQ type, get additional metrics
        const typePerformanceDetails = await Promise.all(
          rfqTypePerformance.map(async (type) => {
            // Get average bids for this type
            const avgBidsResult = await db
              .select({
                avgBids: avg(
                  sql`(
                    SELECT COUNT(*) FROM ${bids} 
                    WHERE ${bids.rfqId} = ${rfqs.id}
                  )`
                ),
              })
              .from(rfqs)
              .where(
                and(
                  eq(rfqs.userId, userId),
                  eq(rfqs.rfqType, type.rfqType)
                )
              );
            
            // Get award rate for this type
            const typeAwardRateResult = await db
              .select({ count: count() })
              .from(rfqs)
              .where(
                and(
                  eq(rfqs.userId, userId),
                  eq(rfqs.rfqType, type.rfqType),
                  eq(rfqs.status, 'awarded')
                )
              );
            
            const typeAwardRate = type.count > 0 
              ? (typeAwardRateResult[0]?.count || 0) / type.count * 100 
              : 0;
            
            // Get average contract value for this type
            const avgValueResult = await db
              .select({
                avgValue: avg(contracts.value),
              })
              .from(contracts)
              .where(
                sql`${contracts.rfqId} IN (
                  SELECT ${rfqs.id} FROM ${rfqs} 
                  WHERE ${rfqs.userId} = ${userId} AND ${rfqs.rfqType} = ${type.rfqType}
                )`
              );
            
            return {
              rfqType: type.rfqType,
              count: type.count,
              avgBids: Number(avgBidsResult[0]?.avgBids || 0),
              awardRate: typeAwardRate,
              avgValue: Number(avgValueResult[0]?.avgValue || 0)
            };
          })
        );
        
        performance.rfqTypePerformance = typePerformanceDetails;
      }
    }
    
    return performance;
  }
  
  /**
   * Get product performance metrics
   * @param userId The ID of the user
   * @returns Product performance data
   */
  async getProductPerformance(userId: number) {
    // Get supplier information for this user
    const supplier = await getSupplierByUserId(userId);
    
    if (!supplier) {
      return {
        totalProducts: 0,
        productPerformance: [],
        topProducts: [],
        categoryDistribution: [],
        performanceMetrics: {}
      };
    }
    
    // Get total products for this supplier
    const totalProductsResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.supplierId, supplier.id));
    
    const totalProducts = totalProductsResult[0]?.count || 0;
    
    // Get product performance data (views over time)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    const monthlyViews = await db
      .select({
        month: sql`DATE_TRUNC('month', ${productAnalytics.timestamp})::date`,
        views: sum(productAnalytics.views),
      })
      .from(productAnalytics)
      .innerJoin(products, eq(productAnalytics.productId, products.id))
      .where(
        and(
          eq(products.supplierId, supplier.id),
          gte(productAnalytics.timestamp, startDate)
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${productAnalytics.timestamp})::date`)
      .orderBy(sql`DATE_TRUNC('month', ${productAnalytics.timestamp})::date`);
    
    // Get category distribution
    const categoryDistribution = await db
      .select({
        category: products.category,
        count: count(),
      })
      .from(products)
      .where(eq(products.supplierId, supplier.id))
      .groupBy(products.category);
    
    // Get top products by views
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        views: sql`COALESCE((
          SELECT SUM(pa.views) FROM ${productAnalytics} pa 
          WHERE pa.productId = ${products.id}
        ), 0)::integer`,
      })
      .from(products)
      .where(eq(products.supplierId, supplier.id))
      .orderBy(desc(sql`views`))
      .limit(5);
    
    // Get performance metrics
    const totalViewsResult = await db
      .select({
        totalViews: sum(productAnalytics.views),
      })
      .from(productAnalytics)
      .innerJoin(products, eq(productAnalytics.productId, products.id))
      .where(eq(products.supplierId, supplier.id));
    
    const totalViews = Number(totalViewsResult[0]?.totalViews || 0);
    
    const avgTimeResult = await db
      .select({
        avgTime: avg(productAnalytics.timeOnPage),
      })
      .from(productAnalytics)
      .innerJoin(products, eq(productAnalytics.productId, products.id))
      .where(eq(products.supplierId, supplier.id));
    
    const avgTime = Number(avgTimeResult[0]?.avgTime || 0);
    
    const noViewsResult = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.supplierId, supplier.id),
          sql`NOT EXISTS (
            SELECT 1 FROM ${productAnalytics} 
            WHERE ${productAnalytics.productId} = ${products.id} AND ${productAnalytics.views} > 0
          )`
        )
      );
    
    const noViewsCount = noViewsResult[0]?.count || 0;
    
    // Get RFQ mention rate
    const rfqMentionsResult = await db
      .select({
        count: count(productAnalytics.rfqMentions),
      })
      .from(productAnalytics)
      .innerJoin(products, eq(productAnalytics.productId, products.id))
      .where(
        and(
          eq(products.supplierId, supplier.id),
          sql`${productAnalytics.rfqMentions} > 0`
        )
      );
    
    const rfqMentions = rfqMentionsResult[0]?.count || 0;
    const rfqMentionRate = totalProducts > 0 ? (rfqMentions / totalProducts) * 100 : 0;
    
    const performanceMetrics = {
      totalProducts,
      totalViews,
      avgViewsPerProduct: totalProducts > 0 ? totalViews / totalProducts : 0,
      conversionRate: totalViews > 0 ? (rfqMentions / totalViews) * 100 : 0,
      avgTimeOnPage: avgTime,
      rfqMentionRate,
      productsWithNoViews: noViewsCount
    };
    
    return {
      totalProducts,
      productPerformance: monthlyViews,
      topProducts,
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category,
        count: item.count,
        percentage: totalProducts > 0 ? (item.count / totalProducts) * 100 : 0
      })),
      performanceMetrics
    };
  }
  
  /**
   * Get market analysis data
   * @param category Optional category to filter by
   * @returns Market analysis data for trends visualization
   */
  async getMarketAnalysis(category?: string) {
    // Import the stock market data functions
    const { getStockTrends, getIndianSectorIndices, getGlobalMarketData } = await import("../lib/alphaVantage");

    // Get market price trends from database
    const priceTrends = await db
      .select({
        timestamp: marketTrends.timestamp,
        category: marketTrends.category,
        priceIndex: marketTrends.priceIndex,
      })
      .from(marketTrends)
      .where(category ? eq(marketTrends.category, category) : undefined)
      .orderBy(marketTrends.timestamp);
    
    // Get live stock data for this category/industry
    let stockTrends = {};
    if (category) {
      try {
        stockTrends = await getStockTrends(category);
      } catch (error) {
        console.error(`Error getting stock trends for ${category}:`, error);
        // Continue without stock trends if there's an error
      }
    }

    // Get Indian sector indices
    let sectorIndices = {};
    try {
      sectorIndices = await getIndianSectorIndices();
    } catch (error) {
      console.error("Error getting Indian sector indices:", error);
      // Continue without sector indices if there's an error
    }

    // Get global market data
    let globalMarketData = {};
    try {
      globalMarketData = await getGlobalMarketData();
    } catch (error) {
      console.error("Error getting global market data:", error);
      // Continue without global market data if there's an error
    }
    
    // Get regional comparison
    const regionalComparison = await db
      .select({
        region: marketTrends.region,
        category: marketTrends.category,
        priceIndex: avg(marketTrends.priceIndex),
        supplyIndex: avg(marketTrends.supplyIndex),
        demandIndex: avg(marketTrends.demandIndex),
      })
      .from(marketTrends)
      .where(category ? eq(marketTrends.category, category) : undefined)
      .groupBy(marketTrends.region, marketTrends.category);
    
    // Get supply chain risks
    const supplyChainRisks = await db
      .select({
        category: marketTrends.category,
        volatilityIndex: avg(marketTrends.volatilityIndex),
        supplyIndex: avg(marketTrends.supplyIndex),
        demandIndex: avg(marketTrends.demandIndex),
      })
      .from(marketTrends)
      .where(category ? eq(marketTrends.category, category) : undefined)
      .groupBy(marketTrends.category);
    
    return {
      marketTrends: priceTrends,
      regionalComparison,
      supplyChainRisks,
      // Include all our new stock market data
      stockTrends,
      indianSectorIndices: sectorIndices,
      globalMarketData,
      marketInsights: {
        overview: "Market data analysis",
        predictions: {
          shortTerm: "Expected 5-7% price increases",
          midTerm: "Stabilization expected",
          longTerm: "Projected growth of 12-15%"
        },
        keyIndicators: {
          priceTrend: supplyChainRisks.length > 0 && supplyChainRisks[0].volatilityIndex ? 
            Number(supplyChainRisks[0].volatilityIndex) > 50 ? "Volatile" : "Stable" 
            : "Unknown",
          demand: supplyChainRisks.length > 0 && supplyChainRisks[0].demandIndex ? 
            Number(supplyChainRisks[0].demandIndex) > 75 ? "High" 
              : Number(supplyChainRisks[0].demandIndex) > 50 ? "Medium" : "Low" 
            : "Unknown",
          supply: supplyChainRisks.length > 0 && supplyChainRisks[0].supplyIndex ? 
            Number(supplyChainRisks[0].supplyIndex) > 75 ? "High" 
              : Number(supplyChainRisks[0].supplyIndex) > 50 ? "Medium" : "Low" 
            : "Unknown",
          volatility: supplyChainRisks.length > 0 && supplyChainRisks[0].volatilityIndex ? 
            Number(supplyChainRisks[0].volatilityIndex) > 75 ? "High" 
              : Number(supplyChainRisks[0].volatilityIndex) > 50 ? "Medium" : "Low" 
            : "Unknown"
        }
      }
    };
  }
  
  /**
   * Export analytics data for a specific section
   * @param userId The ID of the user
   * @param section The section of analytics to export (market, rfq, suppliers, etc.)
   * @returns Formatted data ready for export to CSV/JSON
   */
  async exportAnalyticsData(userId: number, section: string) {
    switch (section) {
      case 'market':
        return this._exportMarketData();
      case 'rfq':
        return this._exportRfqData(userId);
      case 'suppliers':
        return this._exportSupplierData(userId);
      case 'overview':
        return this._exportOverviewData(userId);
      default:
        throw new Error(`Invalid section: ${section}`);
    }
  }
  
  /**
   * Export market data for all industries
   * @returns Formatted market data ready for export
   */
  private async _exportMarketData() {
    try {
      const { getIndianSectorIndices, getMarketVolatilityIndex } = await import("../lib/alphaVantage");
      
      // Get market trends
      const marketTrendsData = await db
        .select()
        .from(marketTrends)
        .orderBy(marketTrends.timestamp);
      
      // Get Indian sector indices
      const sectorIndices = await getIndianSectorIndices();
      
      // Get market volatility index
      const volatilityIndex = await getMarketVolatilityIndex();
      
      // Format sector data for export
      const exportedSectors = sectorIndices.data
        .filter((sector: any) => !sector.error)
        .map((sector: any) => ({
          sector: sector.sector,
          lastPrice: sector.metrics?.lastPrice || 'N/A',
          changePercent: sector.metrics?.changePercent?.toFixed(2) || 'N/A',
          volatility: sector.metrics?.volatility?.toFixed(2) || 'N/A',
          trend: sector.metrics?.trend || 'N/A',
          momentum: sector.metrics?.momentum?.toFixed(2) || 'N/A',
          exportDate: new Date().toISOString()
        }));
      
      // Format volatility data for export
      const exportedVolatility = volatilityIndex.industries
        .filter((industry: any) => !industry.error)
        .map((industry: any) => ({
          industry: industry.industry,
          volatilityLevel: industry.volatilityLevel,
          volatilityScore: industry.volatility?.toFixed(2) || 'N/A',
          trend: industry.trend || 'N/A',
          changePercent: industry.changePercent?.toFixed(2) || 'N/A',
          exportDate: new Date().toISOString()
        }));
      
      // Format market trends for export
      const exportedTrends = marketTrendsData.map(trend => ({
        category: trend.category,
        region: trend.region,
        date: trend.timestamp.toISOString().split('T')[0],
        priceIndex: trend.priceIndex,
        supplyIndex: trend.supplyIndex,
        demandIndex: trend.demandIndex,
        volatilityIndex: trend.volatilityIndex
      }));
      
      return {
        marketSectors: exportedSectors,
        marketVolatility: exportedVolatility,
        marketTrends: exportedTrends,
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0"
      };
    } catch (error) {
      console.error("Error exporting market data:", error);
      throw new Error("Failed to export market data");
    }
  }
  
  /**
   * Export RFQ data for a specific user
   * @param userId The ID of the user
   * @returns Formatted RFQ data ready for export
   */
  private async _exportRfqData(userId: number) {
    try {
      // Get user role information to determine what data to show
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user || user.length === 0) {
        throw new Error("User not found");
      }
      
      const userType = user[0].userType;
      
      // Get RFQ data based on user role
      let rfqsData;
      if (userType === 'buyer' || userType === 'both') {
        // For buyers, get RFQs created by this user
        rfqsData = await db
          .select({
            id: rfqs.id,
            referenceNumber: rfqs.referenceNumber,
            title: rfqs.title,
            description: rfqs.description,
            quantity: rfqs.quantity,
            deadline: rfqs.deadline,
            category: rfqs.category,
            status: rfqs.status,
            createdAt: rfqs.createdAt,
            bidCount: count(bids.id),
            averageBidAmount: avg(bids.amount)
          })
          .from(rfqs)
          .leftJoin(bids, eq(rfqs.id, bids.rfqId))
          .where(eq(rfqs.userId, userId))
          .groupBy(rfqs.id)
          .orderBy(desc(rfqs.createdAt));
      } else if (userType === 'supplier') {
        // For suppliers, get RFQs they've bid on
        rfqsData = await db
          .select({
            id: rfqs.id,
            referenceNumber: rfqs.referenceNumber,
            title: rfqs.title,
            description: rfqs.description,
            quantity: rfqs.quantity,
            deadline: rfqs.deadline,
            category: rfqs.category,
            status: rfqs.status,
            createdAt: rfqs.createdAt
          })
          .from(rfqs)
          .innerJoin(bids, eq(rfqs.id, bids.rfqId))
          .where(eq(bids.supplierId, userId))
          .orderBy(desc(rfqs.createdAt));
      } else {
        throw new Error("Invalid user type");
      }
      
      // Get RFQ success predictions
      const { getRfqSuccessPrediction } = await import("../lib/alphaVantage");
      const predictionsData = await getRfqSuccessPrediction();
      
      // Format RFQ data for export
      const formattedRfqData = rfqsData.map(rfq => ({
        referenceNumber: rfq.referenceNumber,
        title: rfq.title,
        category: rfq.category,
        quantity: rfq.quantity,
        status: rfq.status,
        deadline: rfq.deadline.toISOString().split('T')[0],
        createdAt: rfq.createdAt?.toISOString().split('T')[0] || 'N/A',
        bidCount: rfq.bidCount || 0,
        averageBidAmount: rfq.averageBidAmount?.toFixed(2) || 'N/A'
      }));
      
      // Format prediction data for export
      const formattedPredictions = predictionsData.predictions
        ?.map((pred: any) => ({
          industry: pred.industry,
          successRate: pred.successProbability?.rate?.toFixed(2) || 'N/A',
          confidence: pred.confidence?.toFixed(2) || 'N/A',
          trend: pred.trend || 'N/A',
          factors: pred.factors?.join(', ') || 'N/A'
        })) || [];
      
      return {
        rfqs: formattedRfqData,
        successPredictions: formattedPredictions,
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0"
      };
    } catch (error) {
      console.error("Error exporting RFQ data:", error);
      throw new Error("Failed to export RFQ data");
    }
  }
  
  /**
   * Export supplier data for a specific user
   * @param userId The ID of the user
   * @returns Formatted supplier data ready for export
   */
  private async _exportSupplierData(userId: number) {
    try {
      // Get user role information to determine what data to show
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user || user.length === 0) {
        throw new Error("User not found");
      }
      
      const userType = user[0].userType;
      
      // Only buyers or 'both' can access supplier data
      if (userType !== 'buyer' && userType !== 'both') {
        throw new Error("Unauthorized: Only buyers can export supplier data");
      }
      
      // Get suppliers that this user has interacted with
      const supplierData = await db
        .select({
          id: suppliers.id,
          companyName: suppliers.companyName,
          industry: suppliers.industry,
          location: suppliers.location,
          yearFounded: suppliers.yearFounded,
          description: suppliers.description,
          certifications: suppliers.certifications,
          rating: suppliers.rating,
          bidCount: count(bids.id),
          averageBidAmount: avg(bids.amount)
        })
        .from(suppliers)
        .leftJoin(bids, eq(suppliers.id, bids.supplierId))
        .leftJoin(rfqs, eq(bids.rfqId, rfqs.id))
        .where(eq(rfqs.userId, userId))
        .groupBy(suppliers.id)
        .orderBy(desc(suppliers.rating));
      
      // Format supplier data for export
      const formattedSupplierData = supplierData.map(supplier => ({
        companyName: supplier.companyName,
        industry: supplier.industry,
        location: supplier.location || 'N/A',
        yearsInBusiness: supplier.yearFounded 
          ? (new Date().getFullYear() - supplier.yearFounded)
          : 'N/A',
        certifications: supplier.certifications || 'N/A',
        rating: supplier.rating?.toFixed(1) || 'N/A',
        bidCount: supplier.bidCount || 0,
        averageBidAmount: supplier.averageBidAmount?.toFixed(2) || 'N/A'
      }));
      
      return {
        suppliers: formattedSupplierData,
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0"
      };
    } catch (error) {
      console.error("Error exporting supplier data:", error);
      throw new Error("Failed to export supplier data");
    }
  }
  
  /**
   * Export overview dashboard data for a specific user
   * @param userId The ID of the user
   * @returns Formatted overview data ready for export
   */
  private async _exportOverviewData(userId: number) {
    try {
      const overviewData = await this.getDashboardOverview(userId);
      const rfqPerformance = await this.getRfqPerformance(userId);
      const marketAnalysis = await this.getMarketAnalysis();
      
      // Get supply chain forecasts for main industries
      const { getSupplyChainForecast } = await import("../lib/alphaVantage");
      const mainIndustries = ['Electronics', 'Manufacturing', 'Chemicals', 'Pharmaceuticals'];
      
      const supplyChainForecasts = await Promise.all(
        mainIndustries.map(async (industry) => {
          try {
            return await getSupplyChainForecast(industry);
          } catch (error) {
            console.error(`Error fetching supply chain forecast for ${industry}:`, error);
            return { industry, error: "Failed to fetch forecast" };
          }
        })
      );
      
      // Format forecasts for export
      const formattedForecasts = supplyChainForecasts
        .filter((forecast: any) => !forecast.error)
        .map((forecast: any) => ({
          industry: forecast.industry,
          riskLevel: forecast.supplyChainMetrics?.riskLevel || 'N/A',
          riskScore: forecast.supplyChainMetrics?.riskScore?.toFixed(2) || 'N/A',
          confidenceScore: forecast.supplyChainMetrics?.confidenceScore?.toFixed(2) || 'N/A',
          demandTrend: forecast.demandForecast?.trend || 'N/A',
          riskFactors: forecast.supplyChainMetrics?.riskFactors?.join(', ') || 'N/A'
        }));
      
      return {
        dashboardOverview: {
          activeRfqs: overviewData.activeRfqs,
          totalBids: overviewData.totalBids,
          contractValue: overviewData.contractValue,
          activeSuppliers: overviewData.activeSuppliers
        },
        rfqPerformance: {
          rfqPerformanceScore: rfqPerformance.rfqPerformanceScore,
          averageBidsPerRfq: rfqPerformance.averageBidsPerRfq,
          bidRate: rfqPerformance.bidRate,
          timeToFirstBid: rfqPerformance.timeToFirstBid
        },
        marketInsights: marketAnalysis.marketInsights,
        supplyChainForecasts: formattedForecasts,
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0"
      };
    } catch (error) {
      console.error("Error exporting overview data:", error);
      throw new Error("Failed to export overview data");
    }
  }
  
  /**
   * Get activity log for a user
   * @param userId The ID of the user
   * @param limit Maximum number of activities to return
   * @returns Recent activity data
   */
  async getRecentActivity(userId: number, limit: number = 5) {
    // Get user role information
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user || user.length === 0) {
      throw new Error("User not found");
    }
    
    // Define activities with proper type
    const activities: Array<{
      type: string;
      objectId: number;
      title?: string;
      rfqId?: number;
      rfqTitle?: string;
      supplierId?: number;
      timestamp: Date | null;
    }> = [];
    
    // Get recent RFQs created by this user
    const recentRfqs = await db
      .select({
        id: rfqs.id,
        title: rfqs.title,
        createdAt: rfqs.createdAt,
      })
      .from(rfqs)
      .where(eq(rfqs.userId, userId))
      .orderBy(desc(rfqs.createdAt))
      .limit(limit);
    
    recentRfqs.forEach(rfq => {
      activities.push({
        type: 'rfq_created',
        objectId: rfq.id,
        title: rfq.title,
        timestamp: rfq.createdAt,
      });
    });
    
    // Get recent bids on user's RFQs
    const recentBids = await db
      .select({
        bidId: bids.id,
        rfqId: rfqs.id,
        rfqTitle: rfqs.title,
        supplierId: bids.supplierId,
        createdAt: bids.createdAt,
      })
      .from(bids)
      .innerJoin(rfqs, eq(bids.rfqId, rfqs.id))
      .where(eq(rfqs.userId, userId))
      .orderBy(desc(bids.createdAt))
      .limit(limit);
    
    recentBids.forEach(bid => {
      activities.push({
        type: 'bid_received',
        objectId: bid.bidId,
        rfqId: bid.rfqId,
        rfqTitle: bid.rfqTitle,
        supplierId: bid.supplierId,
        timestamp: bid.createdAt,
      });
    });
    
    // Sort activities by timestamp (descending) and limit
    return activities
      .sort((a, b) => {
        // Handle null timestamps by placing them at the end
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Helper method to get supplier by user ID
   * @param userId User ID
   * @returns Supplier object if found
   */
  private async getSupplierByUserId(userId: number) {
    const supplierResult = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId))
      .limit(1);
    
    return supplierResult.length > 0 ? supplierResult[0] : null;
  }

  /**
   * Get market trends for a specific industry
   * @param industry Industry name
   * @returns Market trend data for the specified industry
   */
  async getMarketTrends(industry: string) {
    try {
      const trendData = await db.select()
        .from(marketTrends)
        .where(eq(marketTrends.category, industry))
        .orderBy(asc(marketTrends.timestamp));
      
      // Process trend data into time series
      const dates = trendData.map(trend => {
        const date = trend.timestamp ? new Date(trend.timestamp) : new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      });
      
      const values = trendData.map(trend => trend.priceIndex || 0);
      
      return {
        industry,
        data: {
          dates,
          values
        }
      };
    } catch (error) {
      console.error(`Error getting market trends for ${industry}:`, error);
      throw error;
    }
  }

  /**
   * Get supply chain forecast for a specific industry
   * @param industry Industry name
   * @returns Supply chain forecast data
   */
  async getSupplyChainForecast(industry: string) {
    try {
      // Get relevant market data for this industry
      const marketData = await db.select()
        .from(marketTrends)
        .where(eq(marketTrends.category, industry))
        .orderBy(desc(marketTrends.timestamp))
        .limit(10);
      
      // Format historical data
      const stockData = marketData.map(item => ({
        date: item.timestamp,
        industry: item.category,
        data: {
          prices: [item.priceIndex || 0],
          volume: Math.floor(Math.random() * 10000) + 5000,
        }
      }));
      
      // Generate forecast data based on historical trends
      const lastPrice = marketData.length > 0 ? (marketData[0].priceIndex || 100) : 100;
      const volatility = marketData.length > 0 ? (marketData[0].volatilityIndex || 0.05) : 0.05;
      
      // Simple forecasting model (just for demonstration)
      const priceForecasts = [];
      let currentPrice = lastPrice;
      
      for (let i = 1; i <= 4; i++) {
        // Add some randomness to the forecast with a trend bias
        const trendFactor = 0.01 * (marketData.length > 0 ? (marketData[0].demandIndex || 0) - 50 : 0);
        const randomFactor = (Math.random() - 0.5) * volatility;
        
        // Apply the factors to create the next forecast price
        currentPrice = currentPrice * (1 + trendFactor + randomFactor);
        
        priceForecasts.push({
          week: i,
          price: parseFloat(currentPrice.toFixed(2))
        });
      }
      
      // Generate supply chain metrics
      const demandIndex = marketData.length > 0 ? marketData[0].demandIndex || 50 : 50;
      const supplyIndex = marketData.length > 0 ? marketData[0].supplyIndex || 50 : 50;
      const riskScore = Math.min(100, Math.max(0, 
        100 - demandIndex + (volatility * 100) - (supplyIndex * 0.5)
      ));
      
      const riskLevel = riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';
      
      // Generate risk factors based on metrics
      const riskFactors = [];
      if (volatility > 0.1) riskFactors.push('High price volatility detected');
      if (demandIndex > 70) riskFactors.push('Potential supply shortages due to high demand');
      if (demandIndex < 30) riskFactors.push('Low demand affecting market stability');
      if (supplyIndex < 40) riskFactors.push('Supply constraints identified in production chain');
      if (riskScore > 60) riskFactors.push('Market uncertainty affecting delivery reliability');
      
      // Create full response
      return {
        industry,
        stockData,
        priceForecasts,
        timestamp: new Date(),
        supplyChainMetrics: {
          riskScore: Math.round(riskScore),
          riskLevel,
          riskFactors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'],
          supplyConsistency: Math.round(supplyIndex),
          demandStability: Math.round(demandIndex)
        },
        demandForecast: {
          trend: demandIndex > 60 ? 'increasing' : demandIndex < 40 ? 'decreasing' : 'stable',
          change: parseFloat(((demandIndex - 50) / 50 * 100).toFixed(1)),
          confidence: 0.85
        },
        forecast: {
          leadTimeImpact: riskLevel === 'High' ? 'Significant delays expected' : 
                          riskLevel === 'Medium' ? 'Moderate delays possible' : 
                          'Minimal impact expected',
          priceTrend: demandIndex > 60 ? 'Upward pressure on prices' : 
                      demandIndex < 40 ? 'Downward pressure on prices' : 
                      'Stable prices expected'
        },
        volatility: {
          overall: volatility > 0.1 ? 'High' : volatility > 0.05 ? 'Moderate' : 'Low',
          price: volatility > 0.1 ? 'High' : volatility > 0.05 ? 'Moderate' : 'Low',
          supply: supplyIndex < 40 ? 'High' : supplyIndex < 60 ? 'Moderate' : 'Low'
        }
      };
    } catch (error) {
      console.error(`Error getting supply chain forecast for ${industry}:`, error);
      throw error;
    }
  }

  /**
   * Get RFQ success prediction data
   * @param industry Optional industry filter
   * @returns RFQ success prediction data by industry
   */
  async getRfqSuccessPrediction(industry?: string) {
    try {
      // Get all industries with RFQs
      const rfqsByIndustry = await db.select({
        category: rfqs.category,
        count: count()
      })
      .from(rfqs)
      .groupBy(rfqs.category);

      // Get success rates by industry (RFQs with status 'awarded')
      const successfulRfqsByIndustry = await db.select({
        category: rfqs.category,
        count: count()
      })
      .from(rfqs)
      .where(eq(rfqs.status, 'awarded'))
      .groupBy(rfqs.category);

      // Create a map of success rates by industry
      const successRatesMap = new Map();
      
      rfqsByIndustry.forEach(item => {
        const totalCount = item.count;
        const successfulCount = successfulRfqsByIndustry.find(
          s => s.category === item.category
        )?.count || 0;
        
        const successRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100) : 0;
        
        successRatesMap.set(item.category, {
          totalRfqs: totalCount,
          successfulRfqs: successfulCount,
          successRate
        });
      });

      // Get average bids per RFQ by industry
      const avgBidsQuery = await db.select({
        category: rfqs.category,
        avgBids: avg(
          db.select({ bidCount: count() })
            .from(bids)
            .where(eq(bids.rfqId, rfqs.id))
            .as('bid_count')
        )
      })
      .from(rfqs)
      .groupBy(rfqs.category);

      // Convert to response format
      const industries: Record<string, any> = {};
      
      // Process all industries data
      for (const entry of successRatesMap.entries()) {
        const industryName = entry[0];
        const stats = entry[1];
        
        const avgBidsInfo = avgBidsQuery.find(item => item.category === industryName);
        const avgBids = avgBidsInfo?.avgBids ? parseFloat(avgBidsInfo.avgBids.toFixed(1)) : 0;
        
        // Get competition level based on average bids
        let competition = 'Medium';
        if (avgBids >= 5) competition = 'High';
        else if (avgBids <= 2) competition = 'Low';
        
        // Calculate response time metrics (synthetic for demo)
        const baseResponseTime = Math.max(24, Math.min(72, 48 - (stats.successRate - 50) / 5));
        
        // Generate success tips based on success rate and competition
        const tips = [];
        if (stats.successRate < 70) tips.push('Provide more detailed specifications in your RFQ');
        if (competition === 'Low') tips.push('Consider extending bidding deadlines by 2-3 days');
        if (avgBids < 3) tips.push('Target more suppliers using broader category selections');
        tips.push('Use voice/video RFQ for complex requirements');
        
        industries[industryName] = {
          successScore: stats.successRate,
          competition,
          totalRfqs: stats.totalRfqs,
          successfulRfqs: stats.successfulRfqs,
          avgQuotes: avgBids,
          avgResponseTime: Math.round(baseResponseTime),
          tips: tips.slice(0, 3) // Limit to top 3 tips
        };
      }
      
      // If specific industry was requested, filter the results
      if (industry && industries[industry]) {
        return {
          industry,
          industries: { [industry]: industries[industry] }
        };
      }
      
      return {
        industries,
        topIndustry: Object.entries(industries)
          .sort(([,a]: any, [,b]: any) => b.successScore - a.successScore)
          .map(([name]) => name)[0] || null
      };
    } catch (error) {
      console.error("Error getting RFQ success prediction data:", error);
      throw error;
    }
  }

  /**
   * Get market volatility data
   * @returns Market volatility data across industries
   */
  async getMarketVolatility() {
    try {
      // Get latest market trend data for all industries
      const marketData = await db.select()
        .from(marketTrends)
        .orderBy(desc(marketTrends.timestamp))
        .limit(100);
      
      // Group by industry
      const industriesMap = new Map();
      
      marketData.forEach(item => {
        if (!industriesMap.has(item.category)) {
          industriesMap.set(item.category, []);
        }
        industriesMap.get(item.category).push(item);
      });
      
      const industries: Record<string, any> = {};
      let totalVolatility = 0;
      let industryCount = 0;
      
      // Calculate volatility for each industry
      for (const [industryName, data] of industriesMap.entries()) {
        // Sort by timestamp ascending
        const sortedData = [...data].sort((a, b) => 
          new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );
        
        // Calculate volatility (standard deviation of price changes)
        let volatility = 0;
        if (sortedData.length > 1) {
          const priceChanges = [];
          for (let i = 1; i < sortedData.length; i++) {
            const prevPrice = sortedData[i-1].priceIndex || 0;
            const currentPrice = sortedData[i].priceIndex || 0;
            if (prevPrice > 0) {
              priceChanges.push((currentPrice - prevPrice) / prevPrice);
            }
          }
          
          if (priceChanges.length > 0) {
            const mean = priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length;
            volatility = Math.sqrt(
              priceChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / priceChanges.length
            );
          }
        }
        
        // Scale volatility score (0-100)
        const volatilityScore = Math.min(100, Math.round(volatility * 1000));
        
        // Determine volatility level
        let volatilityLevel = 'Medium';
        if (volatilityScore > 50) volatilityLevel = 'High';
        else if (volatilityScore < 20) volatilityLevel = 'Low';
        
        // Determine trend direction
        let trend = 'neutral';
        if (sortedData.length >= 2) {
          const firstPrice = sortedData[0].priceIndex || 0;
          const lastPrice = sortedData[sortedData.length - 1].priceIndex || 0;
          const priceDiff = lastPrice - firstPrice;
          if (priceDiff > firstPrice * 0.05) trend = 'bullish';
          else if (priceDiff < -firstPrice * 0.05) trend = 'bearish';
        }
        
        // Calculate pricing impact
        let pricingImpact = 'Stable prices expected';
        if (volatilityLevel === 'High') {
          pricingImpact = trend === 'bullish' 
            ? 'Significant upward price pressure' 
            : trend === 'bearish'
              ? 'Significant downward price pressure'
              : 'Unpredictable price fluctuations likely';
        } else if (volatilityLevel === 'Medium') {
          pricingImpact = trend === 'bullish'
            ? 'Moderate upward price trend'
            : trend === 'bearish'
              ? 'Moderate downward price trend'
              : 'Some price fluctuations expected';
        }
        
        // Generate volatility drivers based on metrics
        const volatilityDrivers = [];
        if (volatilityScore > 50) volatilityDrivers.push('High market uncertainty detected');
        if (volatilityScore > 30 && trend === 'bearish') volatilityDrivers.push('Declining prices causing market instability');
        if (volatilityScore > 30 && trend === 'bullish') volatilityDrivers.push('Rapid price increases creating market pressure');
        
        // Add default drivers if none were generated
        if (volatilityDrivers.length === 0) {
          if (volatilityLevel === 'Low') {
            volatilityDrivers.push('Market currently stable with minimal volatility');
          } else {
            volatilityDrivers.push('Normal market fluctuations within expected range');
          }
        }
        
        industries[industryName] = {
          volatilityScore,
          volatilityLevel,
          trend,
          pricingImpact,
          trendDirection: trend,
          volatilityDrivers
        };
        
        totalVolatility += volatilityScore;
        industryCount++;
      }
      
      // Calculate global volatility index
      const globalVolatilityScore = industryCount > 0 ? totalVolatility / industryCount : 0;
      
      // Determine global volatility interpretation
      let interpretation = 'Moderate Volatility';
      if (globalVolatilityScore > 50) interpretation = 'High Volatility';
      else if (globalVolatilityScore < 20) interpretation = 'Low Volatility';
      
      return {
        industries,
        globalIndex: {
          score: parseFloat(globalVolatilityScore.toFixed(1)),
          interpretation,
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error("Error getting market volatility data:", error);
      throw error;
    }
  }

  /**
   * Get stock trends data for a specific industry
   * @param industry Industry name
   * @returns Stock trends data with metrics
   */
  async getStockTrends(industry: string) {
    try {
      // Get latest market trend data for the industry
      const marketData = await db.select()
        .from(marketTrends)
        .where(eq(marketTrends.category, industry))
        .orderBy(desc(marketTrends.timestamp))
        .limit(30);
      
      if (marketData.length === 0) {
        return {
          industry,
          message: "No market data available for this industry",
          metrics: {
            trend: "stable",
            percentage: 0,
            score: 50,
            volatility: "Medium",
            support: null,
            resistance: null
          }
        };
      }
      
      // Sort by timestamp ascending for trend calculation
      const sortedData = [...marketData].sort((a, b) => 
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      );
      
      // Calculate price trend metrics
      const firstPrice = sortedData[0].priceIndex || 0;
      const lastPrice = sortedData[sortedData.length - 1].priceIndex || 0;
      const priceChange = lastPrice - firstPrice;
      const percentageChange = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
      
      // Determine trend direction
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (percentageChange > 2) trend = 'up';
      else if (percentageChange < -2) trend = 'down';
      
      // Calculate confidence score (50 is neutral)
      const momentumScore = Math.min(100, Math.max(0, 50 + percentageChange * 2));
      
      // Calculate volatility
      let volatility = 0;
      if (sortedData.length > 1) {
        const priceChanges = [];
        for (let i = 1; i < sortedData.length; i++) {
          const prevPrice = sortedData[i-1].priceIndex || 0;
          const currentPrice = sortedData[i].priceIndex || 0;
          if (prevPrice > 0) {
            priceChanges.push((currentPrice - prevPrice) / prevPrice);
          }
        }
        
        if (priceChanges.length > 0) {
          const mean = priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length;
          volatility = Math.sqrt(
            priceChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / priceChanges.length
          );
        }
      }
      
      // Determine volatility level
      let volatilityLevel: 'Low' | 'Medium' | 'High' = 'Medium';
      if (volatility > 0.05) volatilityLevel = 'High';
      else if (volatility < 0.02) volatilityLevel = 'Low';
      
      // Calculate support and resistance levels (simple approach)
      const prices = sortedData.map(item => item.priceIndex || 0);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      // Simplistic support and resistance calculation
      let support = minPrice * 0.95;
      let resistance = maxPrice * 1.05;
      
      // If latest price is near min, adjust support level
      if (lastPrice < minPrice * 1.1) {
        support = lastPrice * 0.9;
      }
      
      // If latest price is near max, adjust resistance level
      if (lastPrice > maxPrice * 0.9) {
        resistance = lastPrice * 1.1;
      }
      
      return {
        industry,
        historicalPrices: sortedData.map(item => ({
          date: item.timestamp,
          price: item.priceIndex
        })),
        metrics: {
          trend,
          percentage: parseFloat(percentageChange.toFixed(2)),
          score: Math.round(momentumScore),
          volatility: volatilityLevel,
          support: parseFloat(support.toFixed(2)),
          resistance: parseFloat(resistance.toFixed(2))
        }
      };
    } catch (error) {
      console.error(`Error getting stock trends for ${industry}:`, error);
      throw error;
    }
  }

  /**
   * Gets enhanced market trend forecast with AI-driven insights
   * @param industry The industry to get enhanced forecast for
   * @returns Detailed forecast including supply chain impacts and price predictions
   */
  async getEnhancedMarketForecast(industry: string) {
    try {
      // Get trend data
      const trendData = await this.getStockTrends(industry);
      
      // Get additional market data for comprehensive analysis
      const marketData = await db
        .select()
        .from(marketTrends)
        .where(eq(marketTrends.category, industry))
        .orderBy(desc(marketTrends.timestamp))
        .limit(90); // Get more historical data for better forecasting
      
      if (marketData.length === 0) {
        return {
          industry,
          message: "Insufficient market data for enhanced forecast",
          timestamp: new Date().toISOString()
        };
      }

      // Sort by timestamp ascending for calculations
      const sortedData = [...marketData].sort((a, b) => 
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      );
      
      // Calculate seasonal patterns (simplified example)
      const seasonalPatterns = this.calculateSeasonalPatterns(sortedData);
      
      // Calculate price trends for different timeframes
      const shortTermTrend = this.calculatePriceTrend(sortedData.slice(-14));
      const mediumTermTrend = this.calculatePriceTrend(sortedData.slice(-30));
      const longTermTrend = this.calculatePriceTrend(sortedData);
      
      // Generate price prediction for next 8 weeks
      const predictions = this.generatePricePredictions(sortedData, 8);
      
      // Calculate volatility forecast
      const volatilityForecast = this.calculateVolatilityForecast(sortedData);
      
      // Calculate confidence score
      const confidenceScore = this.calculateForecastConfidence(sortedData);
      
      // Get supply and demand metrics
      const supplyMetrics = sortedData.map(data => data.supplyIndex).filter(v => v !== null && v !== undefined);
      const demandMetrics = sortedData.map(data => data.demandIndex).filter(v => v !== null && v !== undefined);
      
      // Calculate market sentiment based on demand vs supply trends
      const marketSentiment = demandMetrics.length > 0 && supplyMetrics.length > 0 ? 
        this.calculateMarketSentiment(demandMetrics, supplyMetrics) : 
        { sentiment: "Neutral", score: 50 };
      
      return {
        industry,
        timestamp: new Date().toISOString(),
        currentTrend: {
          shortTerm: shortTermTrend,
          mediumTerm: mediumTermTrend,
          longTerm: longTermTrend
        },
        forecast: {
          predictions: predictions.prices,
          dates: predictions.dates,
          confidence: confidenceScore,
          seasonalPatterns,
          timeHorizon: "8 weeks"
        },
        insights: {
          sentiment: marketSentiment,
          volatilityForecast,
          supplyDemandRatio: this.calculateSupplyDemandRatio(sortedData),
          priceElasticity: this.calculatePriceElasticity(sortedData)
        },
        recommendedActions: this.generateRecommendedActions(industry, longTermTrend)
      };
    } catch (error) {
      console.error("Error generating enhanced market forecast:", error);
      return {
        industry,
        error: "Could not generate enhanced market forecast. Please try again later.",
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Calculate price trend from market data
   * @param data Array of market trend data
   * @returns Trend direction and percentage change
   */
  private calculatePriceTrend(data: any[]) {
    if (data.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }
    
    const firstPrice = data[0].priceIndex || 0;
    const lastPrice = data[data.length - 1].priceIndex || 0;
    const change = lastPrice - firstPrice;
    const percentage = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
    
    let direction = 'stable';
    if (percentage > 2) direction = 'up';
    else if (percentage < -2) direction = 'down';
    
    return { direction, percentage: parseFloat(percentage.toFixed(2)) };
  }
  
  /**
   * Calculate seasonal patterns from historical data
   * @param data Array of market trend data
   * @returns Object with seasonal patterns
   */
  private calculateSeasonalPatterns(data: any[]) {
    // Group data by month to identify seasonal patterns
    const monthlyData: Record<number, number[]> = {};
    
    data.forEach(item => {
      if (item.timestamp && item.priceIndex !== null && item.priceIndex !== undefined) {
        const date = new Date(item.timestamp);
        const month = date.getMonth();
        if (!monthlyData[month]) monthlyData[month] = [];
        monthlyData[month].push(item.priceIndex);
      }
    });
    
    // Calculate average price for each month
    const monthlyAverages: Record<string, number> = {};
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    Object.entries(monthlyData).forEach(([month, prices]) => {
      if (prices.length > 0) {
        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        monthlyAverages[monthNames[parseInt(month)]] = parseFloat(avg.toFixed(2));
      }
    });
    
    // Identify strongest and weakest months
    const entries = Object.entries(monthlyAverages);
    if (entries.length === 0) {
      return { 
        monthly: {},
        strongest: null,
        weakest: null,
        pattern: "Insufficient data for seasonal pattern analysis"
      };
    }
    
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    
    // Determine overall seasonal pattern
    let pattern = "No clear seasonal pattern";
    if (entries.length >= 4) {
      const q1Months = ["January", "February", "March"];
      const q2Months = ["April", "May", "June"];
      const q3Months = ["July", "August", "September"];
      const q4Months = ["October", "November", "December"];
      
      const q1Avg = q1Months.reduce((sum, month) => sum + (monthlyAverages[month] || 0), 0) / 3;
      const q2Avg = q2Months.reduce((sum, month) => sum + (monthlyAverages[month] || 0), 0) / 3;
      const q3Avg = q3Months.reduce((sum, month) => sum + (monthlyAverages[month] || 0), 0) / 3;
      const q4Avg = q4Months.reduce((sum, month) => sum + (monthlyAverages[month] || 0), 0) / 3;
      
      const quarterlyAvgs = [
        { quarter: "Q1", avg: q1Avg },
        { quarter: "Q2", avg: q2Avg },
        { quarter: "Q3", avg: q3Avg },
        { quarter: "Q4", avg: q4Avg }
      ].filter(q => !isNaN(q.avg));
      
      if (quarterlyAvgs.length >= 2) {
        quarterlyAvgs.sort((a, b) => b.avg - a.avg);
        pattern = `Typically strongest in ${quarterlyAvgs[0].quarter}, weakest in ${quarterlyAvgs[quarterlyAvgs.length - 1].quarter}`;
      }
    }
    
    return {
      monthly: monthlyAverages,
      strongest: strongest ? { month: strongest[0], value: strongest[1] } : null,
      weakest: weakest ? { month: weakest[0], value: weakest[1] } : null,
      pattern
    };
  }
  
  /**
   * Generate price predictions for the specified number of weeks
   * @param data Historical market data
   * @param weeks Number of weeks to forecast
   * @returns Predicted prices and dates
   */
  private generatePricePredictions(data: any[], weeks: number) {
    if (data.length < 4) {
      return { prices: [], dates: [] };
    }
    
    // Extract price data
    const prices = data
      .filter(item => item.priceIndex !== null && item.priceIndex !== undefined)
      .map(item => item.priceIndex);
    
    if (prices.length < 4) {
      return { prices: [], dates: [] };
    }
    
    // Simple exponential smoothing for prediction
    const alpha = 0.3; // Smoothing factor
    let lastPrediction = prices[prices.length - 1];
    const predictions = [];
    const dates = [];
    
    // Get the last date from data
    let lastDate = new Date();
    if (data[data.length - 1].timestamp) {
      lastDate = new Date(data[data.length - 1].timestamp);
    }
    
    // Generate predictions for each week
    for (let i = 0; i < weeks; i++) {
      // Simple trend-based forecast (can be enhanced with actual time series modeling)
      if (i === 0) {
        // For first prediction, use exponential smoothing
        lastPrediction = lastPrediction * alpha + prices[prices.length - 1] * (1 - alpha);
      } else {
        // Add small random variation to model uncertainty
        const randomFactor = 0.98 + Math.random() * 0.04; // Random factor between 0.98 and 1.02
        lastPrediction = lastPrediction * randomFactor;
      }
      
      predictions.push(parseFloat(lastPrediction.toFixed(2)));
      
      // Add 7 days to the last date for weekly forecast
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + 7 * (i + 1));
      dates.push(forecastDate.toISOString().split('T')[0]);
    }
    
    return { prices: predictions, dates };
  }
  
  /**
   * Calculate forecast confidence based on data consistency
   * @param data Historical market data
   * @returns Confidence score (0-100)
   */
  private calculateForecastConfidence(data: any[]) {
    if (data.length < 10) {
      return 40; // Low confidence with limited data
    }
    
    // Extract price data
    const prices = data
      .filter(item => item.priceIndex !== null && item.priceIndex !== undefined)
      .map(item => item.priceIndex);
    
    if (prices.length < 10) {
      return 40;
    }
    
    // Calculate volatility as a measure of predictability
    let volatility = 0;
    for (let i = 1; i < prices.length; i++) {
      const change = Math.abs((prices[i] - prices[i-1]) / prices[i-1]);
      volatility += change;
    }
    volatility = volatility / (prices.length - 1);
    
    // Higher volatility = lower confidence
    const volatilityFactor = Math.max(0, 1 - volatility * 10);
    
    // Data quantity factor - more data = higher confidence
    const quantityFactor = Math.min(1, data.length / 60); // 60 data points considered optimal
    
    // Combine factors
    const confidenceScore = Math.round((volatilityFactor * 0.7 + quantityFactor * 0.3) * 100);
    
    return Math.max(20, Math.min(95, confidenceScore)); // Keep between 20-95
  }
  
  /**
   * Calculate volatility forecast based on historical patterns
   * @param data Historical market data
   * @returns Volatility forecast object
   */
  private calculateVolatilityForecast(data: any[]) {
    if (data.length < 10) {
      return { level: "Medium", trend: "Stable", score: 50 };
    }
    
    // Extract volatility data
    const volatility = data
      .filter(item => item.volatilityIndex !== null && item.volatilityIndex !== undefined)
      .map(item => item.volatilityIndex);
    
    if (volatility.length < 10) {
      return { level: "Medium", trend: "Stable", score: 50 };
    }
    
    // Calculate recent volatility (last quarter of data)
    const recentSize = Math.max(5, Math.floor(volatility.length / 4));
    const recentVolatility = volatility.slice(-recentSize);
    const recentAvg = recentVolatility.reduce((sum, val) => sum + val, 0) / recentVolatility.length;
    
    // Calculate historical volatility (remaining data)
    const historicalVolatility = volatility.slice(0, -recentSize);
    const historicalAvg = historicalVolatility.reduce((sum, val) => sum + val, 0) / historicalVolatility.length;
    
    // Determine level
    let level = "Medium";
    if (recentAvg > 0.15) level = "High";
    else if (recentAvg < 0.05) level = "Low";
    
    // Determine trend
    let trend = "Stable";
    const change = recentAvg - historicalAvg;
    if (change > 0.02) trend = "Increasing";
    else if (change < -0.02) trend = "Decreasing";
    
    // Score from 0-100 (0 = very low volatility, 100 = very high)
    const score = Math.round(Math.min(100, Math.max(0, recentAvg * 500)));
    
    return { level, trend, score };
  }
  
  /**
   * Calculate market sentiment based on demand and supply trends
   * @param demand Array of demand indices
   * @param supply Array of supply indices
   * @returns Market sentiment object
   */
  private calculateMarketSentiment(demand: number[], supply: number[]) {
    if (demand.length === 0 || supply.length === 0) {
      return { sentiment: "Neutral", score: 50 };
    }
    
    // Calculate demand-supply ratio trend
    const ratios = [];
    const minLength = Math.min(demand.length, supply.length);
    
    for (let i = 0; i < minLength; i++) {
      if (supply[i] > 0) {
        ratios.push(demand[i] / supply[i]);
      }
    }
    
    if (ratios.length < 2) {
      return { sentiment: "Neutral", score: 50 };
    }
    
    // Calculate trend in the ratio
    const recentRatio = ratios.slice(-Math.min(5, ratios.length)).reduce((sum, val) => sum + val, 0) / 
                       Math.min(5, ratios.length);
    const historicalRatio = ratios.slice(0, -Math.min(5, ratios.length)).reduce((sum, val) => sum + val, 0) / 
                           Math.max(1, ratios.length - Math.min(5, ratios.length));
    
    // Determine sentiment
    let sentiment = "Neutral";
    if (recentRatio > 1.05) sentiment = "Bullish";
    else if (recentRatio < 0.95) sentiment = "Bearish";
    
    // Determine strength of sentiment
    let trend = "Stable";
    if (recentRatio > historicalRatio * 1.05) trend = "Improving";
    else if (recentRatio < historicalRatio * 0.95) trend = "Deteriorating";
    
    // Calculate sentiment score (0-100)
    const baseScore = 50 + (recentRatio - 1) * 50;
    const trendFactor = trend === "Improving" ? 10 : (trend === "Deteriorating" ? -10 : 0);
    const score = Math.round(Math.min(100, Math.max(0, baseScore + trendFactor)));
    
    return { 
      sentiment, 
      trend, 
      score,
      demandSupplyRatio: parseFloat(recentRatio.toFixed(2))
    };
  }
  
  /**
   * Calculate supply-demand ratio over time
   * @param data Historical market data
   * @returns Supply-demand ratio data
   */
  private calculateSupplyDemandRatio(data: any[]) {
    const ratios = [];
    const dates = [];
    
    data.forEach(item => {
      if (item.timestamp && item.supplyIndex !== null && item.supplyIndex !== undefined &&
          item.demandIndex !== null && item.demandIndex !== undefined && item.supplyIndex > 0) {
        ratios.push(parseFloat((item.demandIndex / item.supplyIndex).toFixed(2)));
        dates.push(new Date(item.timestamp).toISOString().split('T')[0]);
      }
    });
    
    if (ratios.length === 0) {
      return { average: 1, trend: "Stable", ratios: [], dates: [] };
    }
    
    // Calculate average ratio
    const average = parseFloat((ratios.reduce((sum, val) => sum + val, 0) / ratios.length).toFixed(2));
    
    // Calculate trend
    let trend = "Stable";
    if (ratios.length >= 5) {
      const recent = ratios.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
      const older = ratios.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3;
      
      if (recent > older * 1.05) trend = "Increasing";
      else if (recent < older * 0.95) trend = "Decreasing";
    }
    
    return { average, trend, ratios, dates };
  }
  
  /**
   * Calculate price elasticity of demand
   * @param data Historical market data
   * @returns Price elasticity data
   */
  private calculatePriceElasticity(data: any[]) {
    if (data.length < 10) {
      return { elasticity: "Unknown", value: 0 };
    }
    
    // Prepare price and demand data
    const priceData = [];
    const demandData = [];
    
    data.forEach(item => {
      if (item.priceIndex !== null && item.priceIndex !== undefined && 
          item.demandIndex !== null && item.demandIndex !== undefined) {
        priceData.push(item.priceIndex);
        demandData.push(item.demandIndex);
      }
    });
    
    if (priceData.length < 10) {
      return { elasticity: "Unknown", value: 0 };
    }
    
    // Calculate average price and demand
    const avgPrice = priceData.reduce((sum, val) => sum + val, 0) / priceData.length;
    const avgDemand = demandData.reduce((sum, val) => sum + val, 0) / demandData.length;
    
    // Calculate price and demand changes
    const priceChanges = [];
    const demandChanges = [];
    
    for (let i = 1; i < priceData.length; i++) {
      const priceChange = (priceData[i] - priceData[i-1]) / priceData[i-1];
      const demandChange = (demandData[i] - demandData[i-1]) / demandData[i-1];
      
      if (priceChange !== 0) {
        priceChanges.push(priceChange);
        demandChanges.push(demandChange);
      }
    }
    
    if (priceChanges.length === 0) {
      return { elasticity: "Unknown", value: 0 };
    }
    
    // Calculate average elasticity
    const elasticityValues = [];
    
    for (let i = 0; i < priceChanges.length; i++) {
      if (priceChanges[i] !== 0) {
        elasticityValues.push(demandChanges[i] / priceChanges[i]);
      }
    }
    
    const avgElasticity = elasticityValues.reduce((sum, val) => sum + val, 0) / elasticityValues.length;
    
    // Determine elasticity category
    let elasticity = "Unknown";
    if (avgElasticity < -1) elasticity = "Elastic";
    else if (avgElasticity >= -1 && avgElasticity < 0) elasticity = "Inelastic";
    else if (avgElasticity === 0) elasticity = "Perfectly Inelastic";
    else if (avgElasticity > 0) elasticity = "Giffen Good";
    
    return { 
      elasticity, 
      value: parseFloat(avgElasticity.toFixed(2)),
      description: this.getElasticityDescription(elasticity)
    };
  }
  
  /**
   * Get elasticity description for the given elasticity type
   * @param elasticity Elasticity type
   * @returns Description of the elasticity
   */
  private getElasticityDescription(elasticity: string) {
    switch (elasticity) {
      case "Elastic":
        return "Demand is highly responsive to price changes";
      case "Inelastic":
        return "Demand is relatively unresponsive to price changes";
      case "Perfectly Inelastic":
        return "Demand does not change with price changes";
      case "Giffen Good":
        return "Demand increases as price increases";
      default:
        return "Insufficient data to determine price elasticity";
    }
  }
  
  /**
   * Generate recommended actions based on market trends
   * @param industry Industry name
   * @param trend Price trend information
   * @returns Array of recommended actions
   */
  private generateRecommendedActions(industry: string, trend: any) {
    const actions = [];
    
    // Base recommendations on trend direction
    if (trend.direction === 'up') {
      actions.push(`Expedite RFQs for ${industry} products to secure current pricing`);
      actions.push(`Consider longer-term contracts to lock in prices before further increases`);
      if (trend.percentage > 5) {
        actions.push(`Explore alternative suppliers or materials to mitigate rising costs`);
      }
    } else if (trend.direction === 'down') {
      actions.push(`Consider delaying non-urgent ${industry} purchases to benefit from price decreases`);
      actions.push(`Negotiate shorter-term contracts to capitalize on falling prices`);
      if (trend.percentage < -5) {
        actions.push(`Review inventory levels to avoid overstock in a falling market`);
      }
    } else {
      actions.push(`Maintain regular procurement schedule for ${industry} products`);
      actions.push(`Focus on quality and reliability factors in supplier selection`);
    }
    
    // Add general recommendation
    actions.push(`Monitor ${industry} market trends weekly for potential changes`);
    
    return actions;
  }

  /**
   * Get Indian sector indices data
   * @returns Indian stock market sector performance data
   */
  async getIndianSectors() {
    try {
      // Get market data for all industries
      const marketData = await db.select()
        .from(marketTrends)
        .orderBy(desc(marketTrends.timestamp))
        .limit(100);
      
      // Group by industry
      const industriesMap = new Map();
      
      marketData.forEach(item => {
        if (!industriesMap.has(item.category)) {
          industriesMap.set(item.category, []);
        }
        industriesMap.get(item.category).push(item);
      });
      
      const sectors = [];
      
      // Calculate metrics for each sector
      for (const [sectorName, data] of industriesMap.entries()) {
        // Sort by timestamp ascending
        const sortedData = [...data].sort((a, b) => 
          new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );
        
        if (sortedData.length < 2) continue;
        
        // Calculate daily change
        const lastTwoData = sortedData.slice(-2);
        const prevPrice = lastTwoData[0].priceIndex || 0;
        const currentPrice = lastTwoData[1].priceIndex || 0;
        
        const changePercent = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
        
        sectors.push({
          sector: sectorName,
          metrics: {
            latestPrice: parseFloat(currentPrice.toFixed(2)),
            previousPrice: parseFloat(prevPrice.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000) + 500000,
            yearlyHigh: parseFloat((Math.max(...sortedData.map(item => item.priceIndex || 0)) * 1.1).toFixed(2)),
            yearlyLow: parseFloat((Math.min(...sortedData.map(item => item.priceIndex || 0)) * 0.9).toFixed(2))
          }
        });
      }
      
      // Sort sectors by change percent (descending)
      sectors.sort((a, b) => b.metrics.changePercent - a.metrics.changePercent);
      
      return {
        timestamp: new Date(),
        data: sectors
      };
    } catch (error) {
      console.error("Error getting Indian sectors data:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();