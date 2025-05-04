/**
 * Simple test script for testing the integration between Industry Trends service
 * and Perplexity API without running the full server.
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Verify environment setup
function verifyEnvironment() {
  console.log("=== Verifying Environment Configuration ===");
  
  // Check for API key
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error("❌ PERPLEXITY_API_KEY environment variable is not set");
    console.log("Please set the PERPLEXITY_API_KEY environment variable to test the integration");
    console.log("You can add it to your Replit Secrets or create a .env file with:");
    console.log("PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx");
    return false;
  }
  
  // Validate API key format
  if (!apiKey.startsWith('pplx-')) {
    console.warn("⚠️ Warning: PERPLEXITY_API_KEY doesn't start with 'pplx-'");
    console.log("This may indicate an incorrectly formatted key. Standard format is: pplx-xxxxxxxxxxxxxxxx");
  }
  
  console.log("✅ PERPLEXITY_API_KEY found in environment");
  return true;
}

// Create simple mock version of the Perplexity service
class TestPerplexityService {
  constructor() {
    // Verify environment before initializing
    if (!verifyEnvironment()) {
      process.exit(1);
    }
    
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.apiUrl = "https://api.perplexity.ai/chat/completions";
    this.defaultModel = "llama-3.1-sonar-small-128k-online";
    console.log(`✅ Using model: ${this.defaultModel}`);
  }
  
  async generateIndustryTrendAnalysis(industry, region) {
    console.log(`Generating trend analysis for ${industry} industry${region ? ` in ${region}` : ''}`);
    
    try {
      const regionSpecificPrompt = region 
        ? `Focus specifically on the ${region} region.` 
        : "Include global perspective with regional highlights where relevant.";
      
      // Build request structure similar to our implementation
      const messages = [
        {
          role: "system",
          content: `You are an expert industry analyst with deep knowledge of market trends, competitive landscapes, and business intelligence. 
            Provide comprehensive, well-structured, and data-driven analysis. 
            Format your response as JSON with the following structure:
            {
              "summary": "Brief executive summary of key findings",
              "marketSize": {
                "current": "Current market size with value in USD",
                "projected": "Projected market size with value in USD",
                "cagr": "Compound Annual Growth Rate"
              },
              "keyPlayers": [
                {"name": "Company Name", "marketShare": "percentage", "keyStrength": "Brief description"},
                ...up to 5 key players only
              ],
              "trendAnalysis": [
                {"trend": "Trend name", "description": "Description", "impact": "High/Medium/Low"},
                ...up to 3 trends only
              ]
            }`
        },
        {
          role: "user",
          content: `Generate a brief industry trend snapshot for the ${industry} industry. ${regionSpecificPrompt} Include current market size, key players, and top 3 emerging trends. Keep it concise for testing purposes.`
        }
      ];
      
      // Show what we're about to send
      console.log("Sending request to Perplexity API...");
      
      // Make request to Perplexity API
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.defaultModel,
          messages: messages,
          temperature: 0.2,
          max_tokens: 500,  // Limiting for test purposes
          top_p: 0.9,
          stream: false,
          frequency_penalty: 1,
          presence_penalty: 0
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );
      
      // Log successful request
      console.log("✅ Successfully received response from Perplexity API");
      console.log("Status:", response.status);
      console.log("Model used:", response.data.model);
      
      // Parse and return the content
      const content = response.data.choices[0].message.content;
      console.log("\nRaw response content:");
      console.log(content);
      
      // Try to parse the JSON
      try {
        const parsedData = JSON.parse(content);
        console.log("\n✅ Successfully parsed JSON response");
        return parsedData;
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError.message);
        console.log("This suggests there might be an issue with the response format");
        return content;
      }
    } catch (error) {
      console.error("❌ Error calling Perplexity API:", error.message);
      
      if (error.response) {
        const status = error.response.status;
        console.error("Status:", status);
        console.error("Response data:", error.response.data);
        
        // Provide specific guidance for common errors
        if (status === 401) {
          console.error("\n=== AUTHENTICATION ERROR (401) ===");
          console.error("This indicates an authentication problem with your Perplexity API key.");
          console.error("Possible solutions:");
          console.error("1. Check that your API key is correctly formatted (should start with 'pplx-')");
          console.error("2. Verify that the API key is active in your Perplexity account");
          console.error("3. Ensure the Authorization header is correctly formatted as 'Bearer YOUR_API_KEY'");
          console.error("4. Try generating a new API key in your Perplexity account");
        } else if (status === 429) {
          console.error("\n=== RATE LIMIT ERROR (429) ===");
          console.error("You've exceeded the rate limits for the Perplexity API.");
          console.error("Please wait a few minutes before trying again.");
        } else if (status >= 500) {
          console.error("\n=== SERVER ERROR (" + status + ") ===");
          console.error("The Perplexity API is experiencing server issues.");
          console.error("Please try again later or check the Perplexity status page.");
        }
      } else if (error.request) {
        console.error("\n=== NETWORK ERROR ===");
        console.error("No response received from Perplexity API.");
        console.error("Please check your internet connection and try again.");
      }
      
      throw new Error(`Failed to generate trend analysis: ${error.message}`);
    }
  }
}

// Create a simplified mock version of the Industry Trends Service that uses the Perplexity Service
class TestIndustryTrendsService {
  constructor(perplexityService) {
    this.perplexityService = perplexityService;
  }
  
  async generateOneClickSnapshot(industry, region) {
    console.log(`\nGenerating one-click snapshot for ${industry}${region ? ` (${region})` : ''}`);
    
    try {
      // Get snapshot data from Perplexity
      console.log("Calling Perplexity service to generate snapshot data...");
      const snapshotData = await this.perplexityService.generateIndustryTrendAnalysis(industry, region);
      
      // In a real implementation, we would save this to the database
      console.log("\n✅ Successfully generated snapshot data");
      
      // Return a mock snapshot that includes the data
      return {
        id: 1,
        industry,
        region: region || null,
        timeframe: "Current",
        snapshotData,
        templateId: 1,
        visibility: "private",
        format: "standard",
        version: 1,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("❌ Error generating snapshot:", error.message);
      throw error;
    }
  }
}

// Run the test
async function testPerplexityIntegration() {
  console.log("=== Testing Perplexity API Integration with Industry Trends Service ===\n");
  
  // Create service instances
  const perplexityService = new TestPerplexityService();
  const industryTrendsService = new TestIndustryTrendsService(perplexityService);
  
  try {
    // Test the integration with a sample industry
    const industry = "Renewable Energy";
    const region = "Asia Pacific";
    
    const snapshot = await industryTrendsService.generateOneClickSnapshot(industry, region);
    
    console.log("\n=== Generated Snapshot Summary ===");
    console.log("Industry:", snapshot.industry);
    console.log("Region:", snapshot.region);
    console.log("Generated at:", snapshot.generatedAt);
    
    console.log("\nSnapshot Summary:", snapshot.snapshotData.summary);
    
    if (snapshot.snapshotData.marketSize) {
      console.log("\nMarket Size:");
      console.log("- Current:", snapshot.snapshotData.marketSize.current);
      console.log("- Projected:", snapshot.snapshotData.marketSize.projected);
      console.log("- CAGR:", snapshot.snapshotData.marketSize.cagr);
    }
    
    if (snapshot.snapshotData.keyPlayers && snapshot.snapshotData.keyPlayers.length) {
      console.log("\nKey Players:");
      snapshot.snapshotData.keyPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.name} (${player.marketShare}) - ${player.keyStrength}`);
      });
    }
    
    console.log("\n✅ Integration test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Integration test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testPerplexityIntegration().catch(error => {
  console.error("Unexpected error during test:", error);
  process.exit(1);
});