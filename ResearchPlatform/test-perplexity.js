/**
 * Test script for Perplexity API integration
 * 
 * This script tests the Perplexity API endpoint to ensure it is working correctly
 * and properly integrated with our Industry Trend Generator.
 */

require('dotenv').config();
const axios = require('axios');

async function testPerplexityAPI() {
  console.log("=== Testing Perplexity API Connection ===");
  
  // Check for API key
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error("❌ PERPLEXITY_API_KEY not found in environment!");
    console.log("Please set your Perplexity API key in the .env file or environment variables.");
    console.log("Example: PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxx");
    return false;
  }
  
  console.log("✅ PERPLEXITY_API_KEY found");
  
  // Validate the API key format
  if (!apiKey.startsWith('pplx-')) {
    console.warn("⚠️ Warning: PERPLEXITY_API_KEY doesn't start with 'pplx-'");
    console.log("This may indicate an incorrectly formatted key. Standard format is: pplx-xxxxxxxxxxxxxxxx");
    console.log("Continuing with the provided key...");
  }
  
  // Create properly formatted headers according to Perplexity API spec
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  
  console.log("✅ Authorization header correctly formatted as 'Bearer <API_KEY>'");
  
  try {
    // Make a simple request to the Perplexity API to verify connectivity
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a helpful, concise assistant."
          },
          {
            role: "user",
            content: "What are the top 3 trends in renewable energy? Answer in under 100 words."
          }
        ],
        max_tokens: 150,
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      },
      { headers }
    );
    
    console.log("✅ Successfully connected to Perplexity API");
    console.log("Status:", response.status);
    console.log("Response model:", response.data.model);
    console.log("Tokens used:", response.data.usage.total_tokens);
    
    // Display the response content
    console.log("\nAPI Response Content:");
    console.log(response.data.choices[0].message.content);
    
    // Check if citations are included
    if (response.data.citations && response.data.citations.length > 0) {
      console.log("\nCitations included:");
      response.data.citations.forEach((citation, index) => {
        console.log(`${index + 1}. ${citation}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Perplexity API!");
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Status:", error.response.status);
      console.error("Error data:", error.response.data);
      
      if (error.response.status === 401) {
        console.log("\nThis appears to be an authentication error. Please check your API key.");
      } else if (error.response.status === 429) {
        console.log("\nYou've exceeded the rate limit. Please try again later.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from Perplexity API. Check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up the request:", error.message);
    }
    
    return false;
  }
}

async function testIndustryTrendWithPerplexity() {
  console.log("\n=== Testing Industry Trend Generation with Perplexity ===");
  
  // Check for API key
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error("❌ PERPLEXITY_API_KEY not found in environment!");
    return false;
  }
  
  try {
    console.log("Generating industry trend analysis for 'Renewable Energy' in 'Asia Pacific'...");
    
    // Industry-specific prompt for Perplexity
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
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
            content: `Generate a brief industry trend snapshot for the Renewable Energy industry. Focus specifically on the Asia Pacific region. Include current market size, key players, and top 3 emerging trends. Keep it concise but informative.`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        stream: false,
        max_tokens: 800
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );
    
    console.log("✅ Successfully generated industry trend analysis");
    
    // Try to parse the JSON response
    try {
      const content = response.data.choices[0].message.content;
      console.log("\nRaw response:");
      console.log(content);
      
      const trendData = JSON.parse(content);
      console.log("\n=== Parsed Trend Analysis ===");
      console.log("Summary:", trendData.summary);
      
      console.log("\nMarket Size:");
      console.log("- Current:", trendData.marketSize.current);
      console.log("- Projected:", trendData.marketSize.projected);
      console.log("- CAGR:", trendData.marketSize.cagr);
      
      console.log("\nKey Players:");
      trendData.keyPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.name} (${player.marketShare}) - ${player.keyStrength}`);
      });
      
      console.log("\nTrend Analysis:");
      trendData.trendAnalysis.forEach((trend, index) => {
        console.log(`${index + 1}. ${trend.trend} - Impact: ${trend.impact}`);
        console.log(`   ${trend.description}`);
      });
      
      return true;
    } catch (parseError) {
      console.error("❌ Error parsing the JSON response:", parseError.message);
      console.log("The API returned a response, but it was not properly formatted JSON.");
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to generate industry trend analysis!");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    
    return false;
  }
}

async function runTests() {
  console.log("==========================================================");
  console.log("  PERPLEXITY API INTEGRATION TEST                         ");
  console.log("==========================================================");
  console.log("This script will test the connection to the Perplexity API");
  console.log("and our Industry Trend Generation functionality.          ");
  console.log("==========================================================\n");
  
  // Run the tests
  const apiTestSuccess = await testPerplexityAPI();
  
  if (apiTestSuccess) {
    // Only test trend generation if basic API test passes
    const trendTestSuccess = await testIndustryTrendWithPerplexity();
    
    if (trendTestSuccess) {
      console.log("\n✅ All tests passed successfully!");
      console.log("The Perplexity API integration is working correctly.");
    } else {
      console.log("\n⚠️ Basic API connection succeeded, but trend generation failed.");
      console.log("Please review the error messages above to troubleshoot.");
    }
  } else {
    console.log("\n❌ Failed to connect to the Perplexity API.");
    console.log("Please check your API key and internet connection.");
  }
  
  console.log("\n==========================================================");
}

// Run all tests
runTests().catch(error => {
  console.error("An unexpected error occurred:", error);
});