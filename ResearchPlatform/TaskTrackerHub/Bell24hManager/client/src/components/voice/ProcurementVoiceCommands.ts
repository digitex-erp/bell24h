import { apiRequest } from '@/lib/queryClient';

/**
 * Command category for voice commands in procurement context
 */
export type CommandCategory = 
  | 'rfq_create'
  | 'rfq_list'
  | 'rfq_view'
  | 'supplier_search'
  | 'supplier_compare'
  | 'analytics'
  | 'help'
  | 'navigation'
  | 'unknown';

/**
 * Structure for enhanced voice command after processing
 */
export interface EnhancedVoiceCommand {
  originalText: string;
  enhancedText: string;
  category: CommandCategory;
  confidence: number;
  entities?: { [key: string]: any };
}

/**
 * Helper function to enhance raw voice command text using GPT if available,
 * or fallback to simple pattern matching
 * 
 * @param text The raw text from speech recognition
 * @returns Enhanced command with category and confidence
 */
export async function enhanceVoiceCommand(text: string): Promise<EnhancedVoiceCommand> {
  try {
    // Try to use the backend enhancement API (GPT-based)
    const response = await apiRequest<{
      command: string;
      intent: string;
      confidence: number;
    }>('/api/voice/enhance', {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Map API intent to our CommandCategory
    const category = mapIntentToCategory(response.intent);
    
    return {
      originalText: text,
      enhancedText: response.command,
      category,
      confidence: response.confidence
    };
  } catch (error) {
    console.warn('Failed to enhance command with API, using simple pattern matching', error);
    
    // Fallback to simple pattern matching
    return simpleCommandEnhancement(text);
  }
}

/**
 * Map API intent strings to our CommandCategory type
 */
function mapIntentToCategory(intent: string): CommandCategory {
  switch (intent) {
    case 'create_rfq':
      return 'rfq_create';
    case 'list_rfqs':
    case 'view_rfqs':
      return 'rfq_list';
    case 'view_rfq':
      return 'rfq_view';
    case 'find_suppliers':
    case 'search_suppliers':
      return 'supplier_search';
    case 'compare_suppliers':
      return 'supplier_compare';
    case 'analytics':
      return 'analytics';
    case 'help':
      return 'help';
    case 'navigation':
      return 'navigation';
    default:
      return 'unknown';
  }
}

/**
 * Simple pattern-based command detection as fallback when API is not available
 */
function simpleCommandEnhancement(text: string): EnhancedVoiceCommand {
  const lowerText = text.toLowerCase();
  let category: CommandCategory = 'unknown';
  let confidence = 0.5;
  
  // RFQ Creation patterns
  if (
    lowerText.includes('create rfq') || 
    lowerText.includes('new rfq') || 
    lowerText.includes('make rfq') ||
    lowerText.includes('start rfq')
  ) {
    category = 'rfq_create';
    confidence = 0.8;
  } 
  // RFQ Listing patterns
  else if (
    lowerText.includes('list rfq') || 
    lowerText.includes('show rfq') || 
    lowerText.includes('view rfqs') ||
    lowerText.includes('my rfqs')
  ) {
    category = 'rfq_list';
    confidence = 0.8;
  }
  // RFQ View specific
  else if (
    lowerText.includes('view rfq') || 
    lowerText.includes('open rfq') || 
    lowerText.includes('see rfq details')
  ) {
    category = 'rfq_view';
    confidence = 0.7;
  }
  // Supplier Search
  else if (
    lowerText.includes('find supplier') || 
    lowerText.includes('search supplier') || 
    lowerText.includes('look for supplier')
  ) {
    category = 'supplier_search';
    confidence = 0.8;
  }
  // Supplier Comparison
  else if (
    lowerText.includes('compare supplier') || 
    lowerText.includes('supplier comparison') ||
    lowerText.includes('evaluate supplier')
  ) {
    category = 'supplier_compare';
    confidence = 0.8;
  }
  // Analytics
  else if (
    lowerText.includes('analytics') || 
    lowerText.includes('report') || 
    lowerText.includes('metrics') ||
    lowerText.includes('dashboard')
  ) {
    category = 'analytics';
    confidence = 0.7;
  }
  // Help
  else if (
    lowerText.includes('help') || 
    lowerText.includes('assistant') || 
    lowerText.includes('what can you do')
  ) {
    category = 'help';
    confidence = 0.9;
  }
  // Navigation
  else if (
    lowerText.includes('go to') || 
    lowerText.includes('navigate to') || 
    lowerText.includes('open page')
  ) {
    category = 'navigation';
    confidence = 0.7;
  }
  
  return {
    originalText: text,
    enhancedText: text.trim(),
    category,
    confidence
  };
}

/**
 * Get a response for the given voice command
 */
export function getCommandResponse(command: EnhancedVoiceCommand): string {
  switch (command.category) {
    case 'rfq_create':
      return "I'll help you create a new RFQ. What category of products are you looking for?";
      
    case 'rfq_list':
      return "Opening your RFQ list. You have several active RFQs pending supplier responses.";
      
    case 'rfq_view':
      return "Opening the RFQ details. This RFQ has 5 supplier quotes available for review.";
      
    case 'supplier_search':
      return "Let's find suppliers for your needs. What specific products or services are you looking for?";
      
    case 'supplier_compare':
      return "I'll help you compare suppliers. You can compare by price, quality ratings, delivery times, and certifications.";
      
    case 'analytics':
      return "Opening the analytics dashboard. You've achieved 15% cost savings on procurement this quarter.";
      
    case 'help':
      return "I'm your procurement assistant. I can help you create and manage RFQs, find and compare suppliers, analyze spending, and more. What would you like to do?";
      
    case 'navigation':
      return "Where would you like to go? You can say dashboard, RFQ list, create RFQ, or analytics.";
      
    case 'unknown':
    default:
      return "I'm not sure what you're asking. Try asking about creating an RFQ, finding suppliers, or viewing analytics. Or say 'help' for more options.";
  }
}

/**
 * Execute an action based on the voice command
 * @param command Enhanced voice command
 * @param navigate Navigation function from wouter
 */
export function executeVoiceCommand(
  command: EnhancedVoiceCommand, 
  navigate: (to: string) => void
): void {
  switch (command.category) {
    case 'rfq_create':
      navigate('/rfq/create');
      break;
      
    case 'rfq_list':
      navigate('/rfq/list');
      break;
      
    case 'analytics':
      navigate('/analytics');
      break;
      
    case 'navigation':
      // Check for specific navigation targets in the command text
      const text = command.enhancedText.toLowerCase();
      
      if (text.includes('dashboard') || text.includes('home')) {
        navigate('/dashboard');
      } else if (text.includes('rfq list') || text.includes('rfqs')) {
        navigate('/rfq/list');
      } else if (text.includes('create rfq') || text.includes('new rfq')) {
        navigate('/rfq/create');
      } else if (text.includes('analytics') || text.includes('reports')) {
        navigate('/analytics');
      }
      break;
      
    // Other commands might not have direct navigation effects
    default:
      break;
  }
}