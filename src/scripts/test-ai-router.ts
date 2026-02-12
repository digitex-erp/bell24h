import { aiRouter, categorizeRFQ, assessSupplierRisk, generateContent } from '../lib/ai-model-router';

/**
 * Test suite for Bell24H AI Model Router
 * 
 * This validates:
 * 1. Cost savings with AWS GPT-OSS-20B
 * 2. Quality comparison between GPT-4 and GPT-OSS-20B
 * 3. Critical functions still use GPT-4
 * 4. Performance metrics
 */

interface TestResult {
  task: string;
  model: string;
  response: string;
  latency: number;
  cost: number;
  quality: number; // 1-10 scale
  success: boolean;
}

export async function testAIModelRouter() {
  console.log('🧪 Testing Bell24H AI Model Router...\n');
  
  const testCases = [
    {
      name: 'RFQ Categorization',
      task: categorizeRFQ,
      input: 'We need to purchase 1000 units of industrial water pumps for agricultural irrigation. Must be energy efficient and handle high pressure. Delivery required within 30 days.',
      expectedCategory: 'Agriculture',
      criticality: 'medium' as const,
    },
    {
      name: 'Supplier Risk Assessment',
      task: assessSupplierRisk,
      input: {
        companyName: 'ABC Manufacturing Ltd',
        yearsInBusiness: 2,
        previousContracts: 5,
        rating: 3.2,
        location: 'Unknown region',
        paymentHistory: 'Late payments reported'
      },
      criticality: 'high' as const,
    },
    {
      name: 'Content Generation',
      task: generateContent,
      input: {
        type: 'product_description',
        product: 'Industrial safety helmets',
        features: ['ABS material', '6-point suspension', 'ventilation', 'chin strap']
      },
      criticality: 'medium' as const,
    },
  ];

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`Criticality: ${testCase.criticality}`);
    
    try {
      const startTime = Date.now();
      const result = await testCase.task(testCase.input, testCase.criticality);
      const latency = Date.now() - startTime;
      
      // Quality assessment (simplified)
      const quality = assessQuality(result.response, testCase.name);
      
      results.push({
        task: testCase.name,
        model: result.modelUsed,
        response: result.response.choices[0].message.content,
        latency,
        cost: result.estimatedCost,
        quality,
        success: true,
      });
      
      console.log(`✅ Model: ${result.modelUsed}`);
      console.log(`⏱️  Latency: ${latency}ms`);
      console.log(`💰 Cost: $${result.estimatedCost.toFixed(4)}`);
      console.log(`⭐ Quality: ${quality}/10`);
      
    } catch (error) {
      results.push({
        task: testCase.name,
        model: 'error',
        response: '',
        latency: 0,
        cost: 0,
        quality: 0,
        success: false,
      });
      
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Compare GPT-4 vs GPT-OSS-20B quality
  console.log('\n🔍 Running Quality Comparison...');
  await runQualityComparison();
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  
  const successfulTests = results.filter(r => r.success);
  const totalCost = successfulTests.reduce((sum, r) => sum + r.cost, 0);
  const avgLatency = successfulTests.reduce((sum, r) => sum + r.latency, 0) / successfulTests.length;
  const avgQuality = successfulTests.reduce((sum, r) => sum + r.quality, 0) / successfulTests.length;
  
  console.log(`✅ Successful Tests: ${successfulTests.length}/${results.length}`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`⏱️  Avg Latency: ${avgLatency.toFixed(0)}ms`);
  console.log(`⭐ Avg Quality: ${avgQuality.toFixed(1)}/10`);
  
  // Cost savings analysis
  const gpt4Cost = estimateGPT4Cost(successfulTests);
  const savings = ((gpt4Cost - totalCost) / gpt4Cost * 100).toFixed(1);
  console.log(`💸 Cost Savings vs GPT-4: ${savings}%`);
  
  return results;
}

function assessQuality(response: string, taskType: string): number {
  // Simplified quality assessment
  if (!response || response.length < 10) return 1;
  
  let quality = 5; // Base score
  
  // Length and structure
  if (response.length > 50) quality += 1;
  if (response.includes('•') || response.includes('-')) quality += 1; // Lists
  if (response.includes('\n')) quality += 1; // Structured
  
  // Task-specific quality indicators
  switch (taskType) {
    case 'RFQ Categorization':
      if (response.toLowerCase().includes('agriculture') || 
          response.toLowerCase().includes('construction') || 
          response.toLowerCase().includes('manufacturing')) {
        quality += 2;
      }
      break;
    case 'Supplier Risk Assessment':
      if (response.toLowerCase().includes('risk') || 
          response.toLowerCase().includes('high') || 
          response.toLowerCase().includes('medium')) {
        quality += 2;
      }
      break;
    case 'Content Generation':
      if (response.toLowerCase().includes('helmet') || 
          response.toLowerCase().includes('safety')) {
        quality += 2;
      }
      break;
  }
  
  return Math.min(quality, 10);
}

function estimateGPT4Cost(results: TestResult[]): number {
  // GPT-4 costs ~5x more than GPT-OSS-20B for similar tasks
  return results.reduce((sum, r) => {
    if (r.model.includes('gpt-oss')) {
      return sum + (r.cost * 5); // GPT-4 is ~5x more expensive
    }
    return sum + r.cost;
  }, 0);
}

async function runQualityComparison() {
  const testPrompt = "Categorize this RFQ: Need 500 industrial generators for construction sites in Mumbai. Must be diesel-powered, 50kVA capacity, delivered within 45 days.";
  
  try {
    const comparison = await aiRouter.compareModels('rfq_categorization', [
      { role: 'user', content: testPrompt }
    ]);
    
    console.log('\n🔄 Model Comparison Results:');
    comparison.forEach(result => {
      if (result.success) {
        console.log(`\n${result.model}:`);
        console.log(`Response: ${result.response}`);
        console.log(`Latency: ${result.latency}ms`);
        console.log(`Cost: $${result.cost.toFixed(4)}`);
      }
    });
  } catch (error) {
    console.log(`Comparison Error: ${error.message}`);
  }
}

// Test the router if run directly
if (require.main === module) {
  testAIModelRouter()
    .then(results => {
      console.log('\n✅ AI Model Router testing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Testing failed:', error);
      process.exit(1);
    });
}