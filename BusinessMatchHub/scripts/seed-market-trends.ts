/**
 * Seed script for populating the marketTrends table with sample data 
 * for testing the enhanced Analytics Dashboard
 */
import { db } from "../server/db";
import { marketTrends } from "../shared/schema";

async function seedMarketTrends() {
  console.log("Seeding market trends data...");

  // Define industries
  const industries = [
    'Electronics',
    'Manufacturing',
    'Chemicals',
    'Textiles',
    'Auto',
    'Pharmaceuticals',
    'Energy',
    'Finance',
    'Technology',
    'Retail',
  ];

  // Generate 6 months of data for each industry
  const today = new Date();
  const data = [];

  for (const industry of industries) {
    let priceIndex = 80 + Math.random() * 20; // Base price index between 80-100
    let demandIndex = 40 + Math.random() * 20; // Base demand index between 40-60
    let supplyIndex = 40 + Math.random() * 20; // Base supply index between 40-60
    let volatilityIndex = 0.03 + Math.random() * 0.05; // Base volatility between 0.03-0.08
    
    // Generate trend data for the past 6 months (monthly data)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // First day of month
      
      // Add some randomness to the trend
      const randomFactor = Math.random() * 0.1 - 0.05; // -5% to +5%
      const demandChange = (Math.random() - 0.5) * 5; // -2.5 to +2.5
      const supplyChange = (Math.random() - 0.5) * 5; // -2.5 to +2.5
      const volatilityChange = (Math.random() - 0.5) * 0.01; // -0.005 to +0.005
      
      // Update values with trend and randomness
      priceIndex = Math.max(50, Math.min(150, priceIndex * (1 + randomFactor)));
      demandIndex = Math.max(10, Math.min(90, demandIndex + demandChange));
      supplyIndex = Math.max(10, Math.min(90, supplyIndex + supplyChange));
      volatilityIndex = Math.max(0.01, Math.min(0.2, volatilityIndex + volatilityChange));
      
      // Add data point for this month
      data.push({
        category: industry,
        subCategory: null,
        region: 'India',
        priceIndex,
        demandIndex,
        supplyIndex,
        volatilityIndex,
        forecast: null,
        timestamp: date,
      });
      
      // Add weekly data for the current month (last month in the loop)
      if (i === 0) {
        // Add 4 weekly data points for the current month
        for (let week = 1; week <= 4; week++) {
          const weekDate = new Date(date);
          weekDate.setDate(week * 7); // Approximately weekly
          
          const weeklyRandomFactor = (Math.random() - 0.5) * 0.04; // -2% to +2%
          const weeklyDemandChange = (Math.random() - 0.5) * 3; // -1.5 to +1.5
          const weeklySupplyChange = (Math.random() - 0.5) * 3; // -1.5 to +1.5
          const weeklyVolatilityChange = (Math.random() - 0.5) * 0.005; // Small volatility changes
          
          // Update weekly values with smaller changes
          const weeklyPriceIndex = Math.max(50, Math.min(150, priceIndex * (1 + weeklyRandomFactor)));
          const weeklyDemandIndex = Math.max(10, Math.min(90, demandIndex + weeklyDemandChange));
          const weeklySupplyIndex = Math.max(10, Math.min(90, supplyIndex + weeklySupplyChange));
          const weeklyVolatilityIndex = Math.max(0.01, Math.min(0.2, volatilityIndex + weeklyVolatilityChange));
          
          data.push({
            category: industry,
            subCategory: null,
            region: 'India',
            priceIndex: weeklyPriceIndex,
            demandIndex: weeklyDemandIndex,
            supplyIndex: weeklySupplyIndex,
            volatilityIndex: weeklyVolatilityIndex,
            forecast: null,
            timestamp: weekDate,
          });
        }
      }
    }
  }

  // Insert the data into the database
  try {
    const result = await db.insert(marketTrends).values(data);
    console.log(`Successfully inserted ${data.length} market trend data points`);
    return result;
  } catch (error) {
    console.error("Error seeding market trends data:", error);
    throw error;
  }
}

// Execute the seed function
(async () => {
  try {
    await seedMarketTrends();
    console.log("Market trends seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
})();