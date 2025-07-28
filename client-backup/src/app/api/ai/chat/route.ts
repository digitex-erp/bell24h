import { CopilotRuntime } from '@copilotkit/backend';
import OpenAI from 'openai';

// This route handles the AI chat functionality
// It's an Edge API route for better performance
export const runtime = 'edge';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  // You can add other OpenAI configurations here
});

// Create a new instance of CopilotRuntime
const copilot = new CopilotRuntime({
  // Optional: Configure CopilotRuntime options here
  debug: process.env.NODE_ENV === 'development',
});

// Handle POST requests to /api/ai/chat
export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json();
    
    // Forward the request to CopilotRuntime which will handle the OpenAI API call
    return copilot.response(req, {
      openai,
      // Add any additional model options here
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 1000,
    });
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    // Return a proper error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}
