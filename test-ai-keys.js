// Test AI Integration with Real API Keys
const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🤖 Testing OpenAI Integration...');
  
  const openai = new OpenAI({
    apiKey: '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'
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ 
        role: 'user', 
        content: 'Generate a short marketing tagline for Bell24h B2B marketplace in India' 
      }],
      model: 'gpt-3.5-turbo',
      max_tokens: 50
    });

    console.log('✅ OpenAI API working!');
    console.log('Response:', completion.choices[0]?.message?.content);
    return { success: true };
  } catch (error) {
    console.error('❌ OpenAI Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testNanoBanana() {
  console.log('🍌 Testing Nano Banana Integration...');
  
  try {
    const response = await fetch('https://api.nanobanana.com/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer AIzaSyC-XH19RV9PgHAgTmduVcEd2IeMz8iwvac',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Create a professional tagline for Bell24h B2B marketplace',
        model: 'marketing-v2',
        max_tokens: 50
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Nano Banana API working!');
      console.log('Response:', data);
      return { success: true };
    } else {
      console.log('⚠️ Nano Banana API response:', response.status, response.statusText);
      const errorData = await response.text();
      console.log('Error details:', errorData);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Nano Banana Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAITests() {
  console.log('🚀 Testing Bell24h AI Integrations...\n');
  
  const openaiResult = await testOpenAI();
  console.log('\n');
  
  const nanoBananaResult = await testNanoBanana();
  console.log('\n');
  
  console.log('📊 AI Integration Test Results:');
  console.log('OpenAI:', openaiResult.success ? '✅ WORKING' : '❌ FAILED');
  console.log('Nano Banana:', nanoBananaResult.success ? '✅ WORKING' : '❌ FAILED');
  
  if (openaiResult.success && nanoBananaResult.success) {
    console.log('\n🎉 ALL AI INTEGRATIONS WORKING!');
    console.log('Bell24h AI features are ready for production!');
  } else {
    console.log('\n⚠️ Some AI integrations need attention');
  }
}

runAITests().catch(console.error);
