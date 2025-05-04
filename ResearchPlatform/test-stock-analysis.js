/**
 * Test script for Industry-Specific Stock Analysis
 * 
 * This script tests the Stock Analysis API endpoints to ensure they are working correctly
 * and providing accurate industry-specific market insights.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testStockAnalysis() {
  console.log('===== Testing Industry-Specific Stock Analysis API =====\n');
  
  try {
    await testIndustryAnalysis();
    await testIndustrySymbols();
    await testPriceHistory();
    await testStockInsights();
    await testIndustryComparison();
    await testMarketTrends();
    
    console.log('\n✅ All Stock Analysis API tests passed!');
  } catch (error) {
    console.error('\n❌ Stock Analysis API tests failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test industry-specific stock analysis endpoint
 */
async function testIndustryAnalysis() {
  console.log('Testing Industry Stock Analysis...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/stock-analysis/industry/1`);
    
    console.log(`  ✅ Industry Analysis Response: ${response.status}`);
    
    const data = response.data;
    
    // Validate response structure
    if (!data.industry || !data.sector || !data.topPerformers || !data.worstPerformers) {
      throw new Error('Missing required fields in industry analysis response');
    }
    
    console.log(`  ✅ Industry: ${data.industry}`);
    console.log(`  ✅ Market Trend: ${data.marketTrend}`);
    console.log(`  ✅ Average Performance: ${data.averagePerformance.toFixed(2)}%`);
    console.log(`  ✅ Number of Top Performers: ${data.topPerformers.length}`);
    console.log(`  ✅ Number of Worst Performers: ${data.worstPerformers.length}`);
    console.log(`  ✅ Key Events: ${data.keyEvents.length}`);
  } catch (error) {
    console.error(`  ❌ Industry Analysis Error: ${error.message}`);
    if (error.response) {
      console.error(`  ❌ Status: ${error.response.status}`);
      console.error(`  ❌ Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Test industry symbols endpoint
 */
async function testIndustrySymbols() {
  console.log('\nTesting Industry Symbols...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/stock-analysis/industry/1/symbols`);
    
    console.log(`  ✅ Industry Symbols Response: ${response.status}`);
    
    const symbols = response.data;
    
    // Validate response structure
    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error('Invalid or empty symbols list');
    }
    
    console.log(`  ✅ Retrieved ${symbols.length} symbols`);
    console.log(`  ✅ First Symbol: ${symbols[0].symbol} (${symbols[0].name})`);
  } catch (error) {
    console.error(`  ❌ Industry Symbols Error: ${error.message}`);
    if (error.response) {
      console.error(`  ❌ Status: ${error.response.status}`);
      console.error(`  ❌ Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Test price history endpoint
 */
async function testPriceHistory() {
  console.log('\nTesting Price History...');
  
  try {
    // First get a valid symbol ID by querying the symbols endpoint
    const symbolsResponse = await axios.get(`${BASE_URL}/api/stock-analysis/industry/1/symbols`);
    const symbolId = symbolsResponse.data[0].id;
    
    // Now get price history for that symbol
    const response = await axios.get(`${BASE_URL}/api/stock-analysis/symbol/${symbolId}/price-history?timeframe=weekly`);
    
    console.log(`  ✅ Price History Response: ${response.status}`);
    
    const data = response.data;
    
    // Validate response structure
    if (!data.symbol || !data.data || !Array.isArray(data.data)) {
      throw new Error('Missing required fields in price history response');
    }
    
    console.log(`  ✅ Symbol: ${data.symbol} (${data.name})`);
    console.log(`  ✅ Data Points: ${data.data.length}`);
    console.log(`  ✅ Date Range: ${data.startDate} to ${data.endDate}`);
    console.log(`  ✅ Overall Change: ${data.overallChangePercent.toFixed(2)}%`);
  } catch (error) {
    console.error(`  ❌ Price History Error: ${error.message}`);
    if (error.response) {
      console.error(`  ❌ Status: ${error.response.status}`);
      console.error(`  ❌ Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Test stock insights endpoint
 */
async function testStockInsights() {
  console.log('\nTesting Stock Insights...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/stock-analysis/industry/1/insights`);
    
    console.log(`  ✅ Stock Insights Response: ${response.status}`);
    
    const insights = response.data;
    
    // Validate response structure
    if (!Array.isArray(insights) || insights.length === 0) {
      throw new Error('Invalid or empty insights list');
    }
    
    console.log(`  ✅ Retrieved ${insights.length} insights`);
    console.log(`  ✅ First Insight: ${insights[0].title}`);
    console.log(`  ✅ Sentiment: ${insights[0].sentiment}`);
    console.log(`  ✅ Confidence: ${insights[0].confidenceScore.toFixed(2)}`);
  } catch (error) {
    console.error(`  ❌ Stock Insights Error: ${error.message}`);
    if (error.response) {
      console.error(`  ❌ Status: ${error.response.status}`);
      console.error(`  ❌ Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Test industry comparison endpoint
 */
async function testIndustryComparison() {
  console.log('\nTesting Industry Comparison...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/stock-analysis/compare?industryIds=1,2,3,4,5`);
    
    console.log(`  ✅ Industry Comparison Response: ${response.status}`);
    
    const comparison = response.data;
    
    // Validate response structure
    if (!Array.isArray(comparison) || comparison.length === 0) {
      throw new Error('Invalid or empty comparison list');
    }
    
    console.log(`  ✅ Retrieved comparison for ${comparison.length} industries`);
    console.log(`  ✅ First Industry: ${comparison[0].industry}`);
    console.log(`  ✅ Performance: ${comparison[0].performance.toFixed(2)}%`);
    console.log(`  ✅ Top Symbol: ${comparison[0].topSymbol.symbol}`);
  } catch (error) {
    console.error(`  ❌ Industry Comparison Error: ${error.message}`);
    if (error.response) {
      console.error(`  ❌ Status: ${error.response.status}`);
      console.error(`  ❌ Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Test market trends endpoint
 */
async function testMarketTrends() {
  console.log('\nTesting Market Trends...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/stock-analysis/market-trends`);
    
    console.log(`  ✅ Market Trends Response: ${response.status}`);
    
    const trends = response.data;
    
    // Validate response structure
    if (!trends.overallTrend || !trends.topIndustries || !trends.worstIndustries) {
      throw new Error('Missing required fields in market trends response');
    }
    
    console.log(`  ✅ Overall Trend: ${trends.overallTrend.toUpperCase()}`);
    console.log(`  ✅ Top Industries: ${trends.topIndustries.length}`);
    console.log(`  ✅ Worst Industries: ${trends.worstIndustries.length}`);
    console.log(`  ✅ Market Movers: ${trends.marketMovers.length}`);
    console.log(`  ✅ Key Insights: ${trends.keyInsights.length}`);
  } catch (error) {
    console.error(`  ❌ Market Trends Error: ${error.message}`);
    if (error.response) {
      console.error(`  ❌ Status: ${error.response.status}`);
      console.error(`  ❌ Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// Execute the tests
testStockAnalysis();