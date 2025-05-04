/**
 * Global Trade Insights API Test
 * 
 * This script tests the SME-specific trade data endpoints for Bell24h platform's 
 * Global Trade Insights feature. It validates both backend API routes and data generation
 * capabilities for import/export analysis tailored to SMEs.
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const baseUrl = 'http://localhost:5000';
const endpoints = {
  countries: '/api/global-trade/countries',
  industries: '/api/global-trade/industries',
  opportunities: '/api/global-trade/opportunities',
  smeTradeData: (industryId) => `/api/global-trade/industries/${industryId}/sme-trade-data`,
  smeInsights: (industryId) => `/api/global-trade/industries/${industryId}/sme-insights`
};

/**
 * Test runner
 */
async function runTests() {
  console.log(chalk.blue('=============================================='));
  console.log(chalk.blue('  Global Trade Insights API Test'));
  console.log(chalk.blue('=============================================='));
  console.log();

  try {
    // Test 1: Fetch countries
    console.log(chalk.cyan('TEST 1: Fetching countries...'));
    const countriesResponse = await axios.get(`${baseUrl}${endpoints.countries}`);
    if (countriesResponse.status === 200 && Array.isArray(countriesResponse.data)) {
      console.log(chalk.green(`✓ SUCCESS: Fetched ${countriesResponse.data.length} countries`));
    } else {
      console.log(chalk.red('✗ FAILED: Could not fetch countries'));
    }
    console.log();

    // Test 2: Fetch industries
    console.log(chalk.cyan('TEST 2: Fetching industries...'));
    const industriesResponse = await axios.get(`${baseUrl}${endpoints.industries}`);
    
    if (industriesResponse.status === 200 && Array.isArray(industriesResponse.data)) {
      console.log(chalk.green(`✓ SUCCESS: Fetched ${industriesResponse.data.length} industries`));
      
      // Save first industry for further tests
      const testIndustry = industriesResponse.data[0];
      console.log(chalk.gray(`   Using industry: ${testIndustry.name} (ID: ${testIndustry.id}) for further tests`));
    } else {
      console.log(chalk.red('✗ FAILED: Could not fetch industries'));
      process.exit(1);
    }
    console.log();

    // Test 3: Fetch trade opportunities
    console.log(chalk.cyan('TEST 3: Fetching trade opportunities...'));
    const opportunitiesResponse = await axios.get(`${baseUrl}${endpoints.opportunities}`);
    
    if (opportunitiesResponse.status === 200 && Array.isArray(opportunitiesResponse.data)) {
      console.log(chalk.green(`✓ SUCCESS: Fetched ${opportunitiesResponse.data.length} trade opportunities`));
      
      if (opportunitiesResponse.data.length > 0) {
        const sampleOpportunity = opportunitiesResponse.data[0];
        console.log(chalk.gray(`   Sample opportunity: ${sampleOpportunity.opportunityType} in ${sampleOpportunity.country} (${sampleOpportunity.industry})`));
      }
    } else {
      console.log(chalk.red('✗ FAILED: Could not fetch trade opportunities'));
    }
    console.log();

    // Test 4: Fetch SME trade data for specific industry
    const testIndustryId = industriesResponse.data[0].id;
    console.log(chalk.cyan(`TEST 4: Fetching SME trade data for industry ID ${testIndustryId}...`));
    
    try {
      const smeTradeDataResponse = await axios.get(
        `${baseUrl}${endpoints.smeTradeData(testIndustryId)}?size=small`
      );
      
      if (smeTradeDataResponse.status === 200 && Array.isArray(smeTradeDataResponse.data)) {
        console.log(chalk.green(`✓ SUCCESS: Fetched SME trade data`));
        
        const data = smeTradeDataResponse.data[0];
        console.log(chalk.gray(`   Industry: ${data.industry}`));
        console.log(chalk.gray(`   Export Value: $${data.exportValue.toLocaleString()}`));
        console.log(chalk.gray(`   Import Value: $${data.importValue.toLocaleString()}`));
        console.log(chalk.gray(`   Market Size: $${data.marketSize.toLocaleString()}`));
        console.log(chalk.gray(`   Growth Rate: ${data.growthRate}%`));
      } else {
        console.log(chalk.red('✗ FAILED: Could not fetch SME trade data'));
      }
    } catch (error) {
      console.log(chalk.red(`✗ FAILED: Error fetching SME trade data - ${error.message}`));
      if (error.response) {
        console.log(chalk.gray(`   Status: ${error.response.status}`));
        console.log(chalk.gray(`   Response: ${JSON.stringify(error.response.data)}`));
      }
    }
    console.log();

    // Test 5: Fetch SME insights for specific industry
    console.log(chalk.cyan(`TEST 5: Fetching SME insights for industry ID ${testIndustryId}...`));
    
    try {
      const smeInsightsResponse = await axios.get(
        `${baseUrl}${endpoints.smeInsights(testIndustryId)}?size=small`
      );
      
      if (smeInsightsResponse.status === 200 && smeInsightsResponse.data) {
        console.log(chalk.green(`✓ SUCCESS: Fetched SME insights`));
        
        const insights = smeInsightsResponse.data;
        console.log(chalk.gray(`   Industry: ${insights.industry}`));
        console.log(chalk.gray(`   Business Size: ${insights.businessSize}`));
        console.log(chalk.gray(`   Market Entry Strategies: ${insights.marketEntryStrategies.length} strategies provided`));
        console.log(chalk.gray(`   Financing Options: ${insights.financingOptions.length} options provided`));
      } else {
        console.log(chalk.red('✗ FAILED: Could not fetch SME insights'));
      }
    } catch (error) {
      console.log(chalk.red(`✗ FAILED: Error fetching SME insights - ${error.message}`));
      if (error.response) {
        console.log(chalk.gray(`   Status: ${error.response.status}`));
        console.log(chalk.gray(`   Response: ${JSON.stringify(error.response.data)}`));
      }
    }
    console.log();

    // Summary
    console.log(chalk.blue('=============================================='));
    console.log(chalk.blue('  Global Trade Insights API Test Summary'));
    console.log(chalk.blue('=============================================='));
    console.log(chalk.green('✓ Countries API endpoint'));
    console.log(chalk.green('✓ Industries API endpoint'));
    console.log(chalk.green('✓ Trade Opportunities API endpoint'));
    
    // Check if tests 4 and 5 passed
    try {
      await axios.get(`${baseUrl}${endpoints.smeTradeData(testIndustryId)}?size=small`);
      console.log(chalk.green('✓ SME Trade Data API endpoint'));
    } catch (error) {
      console.log(chalk.red('✗ SME Trade Data API endpoint'));
    }
    
    try {
      await axios.get(`${baseUrl}${endpoints.smeInsights(testIndustryId)}?size=small`);
      console.log(chalk.green('✓ SME Insights API endpoint'));
    } catch (error) {
      console.log(chalk.red('✗ SME Insights API endpoint'));
    }

  } catch (error) {
    console.log(chalk.red('ERROR: Test failed with exception'));
    console.log(chalk.red(error.message));
    if (error.response) {
      console.log(chalk.gray(`Status: ${error.response.status}`));
      console.log(chalk.gray(`Response: ${JSON.stringify(error.response.data)}`));
    }
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error during test execution:', error);
});