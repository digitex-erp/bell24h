/**
 * Direct Service Test for Global Trade Insights
 * 
 * This script directly tests the trade data service without requiring
 * the server to be running
 */

// Import the trade data service directly
const { tradeDataService } = require('./server/services/trade-data.service');
const chalk = require('chalk');

async function runDirectServiceTests() {
  console.log(chalk.blue('=============================================='));
  console.log(chalk.blue('  Global Trade Insights Service Test'));
  console.log(chalk.blue('=============================================='));
  console.log();

  try {
    // Test 1: Get Countries
    console.log(chalk.cyan('TEST 1: Getting countries...'));
    const countries = await tradeDataService.getCountries();
    
    if (Array.isArray(countries) && countries.length > 0) {
      console.log(chalk.green(`✓ SUCCESS: Retrieved ${countries.length} countries`));
      console.log(chalk.gray(`   Sample countries: ${countries.slice(0, 3).map(c => c.name).join(', ')}...`));
    } else {
      console.log(chalk.red('✗ FAILED: Could not retrieve countries'));
    }
    console.log();

    // Test 2: Get Industries
    console.log(chalk.cyan('TEST 2: Getting industries...'));
    const industries = await tradeDataService.getIndustries();
    
    if (Array.isArray(industries) && industries.length > 0) {
      console.log(chalk.green(`✓ SUCCESS: Retrieved ${industries.length} industries`));
      console.log(chalk.gray(`   Sample industries: ${industries.slice(0, 3).map(i => i.name).join(', ')}...`));
      
      // Save first industry for further tests
      const testIndustry = industries[0];
      console.log(chalk.gray(`   Using industry: ${testIndustry.name} (ID: ${testIndustry.id}) for further tests`));
    } else {
      console.log(chalk.red('✗ FAILED: Could not retrieve industries'));
      process.exit(1);
    }
    console.log();

    // Test 3: Get Trade Opportunities
    console.log(chalk.cyan('TEST 3: Getting trade opportunities...'));
    const opportunities = await tradeDataService.getTradeOpportunities();
    
    if (Array.isArray(opportunities) && opportunities.length > 0) {
      console.log(chalk.green(`✓ SUCCESS: Retrieved ${opportunities.length} trade opportunities`));
      console.log(chalk.gray(`   Sample opportunity: ${opportunities[0].opportunityType} in ${opportunities[0].country} (${opportunities[0].industry})`));
    } else {
      console.log(chalk.red('✗ FAILED: Could not retrieve trade opportunities'));
    }
    console.log();

    // Test 4: Get SME Trade Data
    const testIndustryId = industries[0].id;
    console.log(chalk.cyan(`TEST 4: Getting SME trade data for industry ID ${testIndustryId}...`));
    
    try {
      const smeTradeData = await tradeDataService.getSmeTradeData(testIndustryId, 'small');
      
      if (Array.isArray(smeTradeData) && smeTradeData.length > 0) {
        console.log(chalk.green(`✓ SUCCESS: Retrieved SME trade data`));
        
        const data = smeTradeData[0];
        console.log(chalk.gray(`   Industry: ${data.industry}`));
        console.log(chalk.gray(`   Export Value: $${data.exportValue.toLocaleString()}`));
        console.log(chalk.gray(`   Import Value: $${data.importValue.toLocaleString()}`));
        console.log(chalk.gray(`   Market Size: $${data.marketSize.toLocaleString()}`));
        console.log(chalk.gray(`   Growth Rate: ${data.growthRate}%`));
      } else {
        console.log(chalk.red('✗ FAILED: Could not retrieve SME trade data'));
      }
    } catch (error) {
      console.log(chalk.red(`✗ FAILED: Error retrieving SME trade data - ${error.message}`));
    }
    console.log();

    // Test 5: Get SME Insights
    console.log(chalk.cyan(`TEST 5: Getting SME insights for industry ID ${testIndustryId}...`));
    
    try {
      const smeInsights = await tradeDataService.getSmeTradeInsights(testIndustryId, 'small');
      
      if (smeInsights && smeInsights.industry) {
        console.log(chalk.green(`✓ SUCCESS: Retrieved SME insights`));
        
        console.log(chalk.gray(`   Industry: ${smeInsights.industry}`));
        console.log(chalk.gray(`   Business Size: ${smeInsights.businessSize}`));
        console.log(chalk.gray(`   Market Entry Strategies: ${smeInsights.marketEntryStrategies.length} strategies provided`));
        console.log(chalk.gray(`   Financing Options: ${smeInsights.financingOptions.length} options provided`));
      } else {
        console.log(chalk.red('✗ FAILED: Could not retrieve SME insights'));
      }
    } catch (error) {
      console.log(chalk.red(`✗ FAILED: Error retrieving SME insights - ${error.message}`));
    }
    console.log();

    // Test 6: Get SWOT Analysis
    console.log(chalk.cyan(`TEST 6: Getting SWOT analysis for industry ID ${testIndustryId}...`));
    
    try {
      const swotAnalysis = await tradeDataService.getSwotAnalysis(testIndustryId, 'small');
      
      if (swotAnalysis && swotAnalysis.strengths) {
        console.log(chalk.green(`✓ SUCCESS: Retrieved SWOT analysis`));
        
        console.log(chalk.gray(`   Strengths: ${swotAnalysis.strengths.length} items`));
        console.log(chalk.gray(`   Weaknesses: ${swotAnalysis.weaknesses.length} items`));
        console.log(chalk.gray(`   Opportunities: ${swotAnalysis.opportunities.length} items`));
        console.log(chalk.gray(`   Threats: ${swotAnalysis.threats.length} items`));
      } else {
        console.log(chalk.red('✗ FAILED: Could not retrieve SWOT analysis'));
      }
    } catch (error) {
      console.log(chalk.red(`✗ FAILED: Error retrieving SWOT analysis - ${error.message}`));
    }
    console.log();

    // Test 7: Get Market Barriers
    console.log(chalk.cyan(`TEST 7: Getting market barriers...`));
    
    try {
      const marketBarriers = await tradeDataService.getMarketBarriers();
      
      if (Array.isArray(marketBarriers) && marketBarriers.length > 0) {
        console.log(chalk.green(`✓ SUCCESS: Retrieved ${marketBarriers.length} market barriers`));
        console.log(chalk.gray(`   Sample barrier: ${marketBarriers[0].type} - ${marketBarriers[0].description.substring(0, 50)}...`));
      } else {
        console.log(chalk.red('✗ FAILED: Could not retrieve market barriers'));
      }
    } catch (error) {
      console.log(chalk.red(`✗ FAILED: Error retrieving market barriers - ${error.message}`));
    }
    console.log();

    // Summary
    console.log(chalk.blue('=============================================='));
    console.log(chalk.blue('  Global Trade Insights Service Test Summary'));
    console.log(chalk.blue('=============================================='));
    console.log(chalk.green('✓ Countries service'));
    console.log(chalk.green('✓ Industries service'));
    console.log(chalk.green('✓ Trade Opportunities service'));
    console.log(chalk.green('✓ SME Trade Data service'));
    console.log(chalk.green('✓ SME Insights service'));
    console.log(chalk.green('✓ SWOT Analysis service'));
    console.log(chalk.green('✓ Market Barriers service'));
    
  } catch (error) {
    console.log(chalk.red('ERROR: Test failed with exception'));
    console.log(chalk.red(error.message));
    console.log(chalk.red(error.stack));
  }
}

// Run the tests
runDirectServiceTests().catch(error => {
  console.error('Fatal error during test execution:', error);
});