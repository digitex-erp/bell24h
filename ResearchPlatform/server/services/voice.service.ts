import { OpenAIService } from './openai.service';

export interface RfqDetails {
  productName: string;
  quantity: number | null;
  specifications: string | null;
  deliveryDate: string | null;
  budget: number | null;
  location: string | null;
  preferredSuppliers: string[] | null;
  urgency: 'low' | 'medium' | 'high' | null;
  additionalRequirements: string | null;
  contactInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface VoiceCommandResult {
  command: string;
  action: string;
  parameters: any;
  success: boolean;
  confidence: number;
}

export class VoiceService {
  private openAIService: OpenAIService;
  
  // Map of ISO language codes to their full names
  private supportedLanguages = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'ar': 'Arabic',
    'zh': 'Chinese',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    // Adding more Indian languages for better coverage
  };
  
  // Language-specific voice commands
  private voiceCommands = {
    'en': {
      createRfq: ['create rfq', 'new rfq', 'start rfq', 'request quote', 'request quotation', 'get price quote'],
      searchSupplier: ['search supplier', 'find supplier', 'look for supplier', 'find vendor', 'locate manufacturer'],
      showStatus: ['show status', 'check status', 'status update', 'track order', 'order progress'],
      compareSuppliers: ['compare suppliers', 'compare prices', 'supplier comparison', 'best supplier'],
      helpAssistant: ['help me', 'assistant', 'guidance', 'how to use', 'instructions'],
    },
    'hi': {
      createRfq: ['आरएफक्यू बनाएं', 'नया आरएफक्यू', 'आरएफक्यू शुरू करें', 'कोटेशन मांगें', 'मूल्य जानें'],
      searchSupplier: ['सप्लायर खोजें', 'विक्रेता खोजें', 'सप्लायर ढूंढें', 'निर्माता खोजें'],
      showStatus: ['स्थिति दिखाएं', 'स्थिति जांचें', 'स्टेटस अपडेट', 'ऑर्डर ट्रैक करें'],
      compareSuppliers: ['सप्लायर तुलना', 'कीमतों की तुलना करें', 'बेस्ट सप्लायर'],
      helpAssistant: ['मदद चाहिए', 'सहायता', 'निर्देश', 'कैसे उपयोग करें'],
    },
    'es': {
      createRfq: ['crear rfq', 'nueva rfq', 'iniciar rfq', 'solicitar cotización', 'pedir precio'],
      searchSupplier: ['buscar proveedor', 'encontrar proveedor', 'localizar proveedor', 'buscar fabricante'],
      showStatus: ['mostrar estado', 'verificar estado', 'actualización de estado', 'seguir pedido'],
      compareSuppliers: ['comparar proveedores', 'comparar precios', 'mejor proveedor'],
      helpAssistant: ['ayuda', 'asistente', 'instrucciones', 'cómo usar'],
    },
    // Add more languages as they are supported
  };

  constructor() {
    this.openAIService = new OpenAIService();
  }

  async transcribeAudio(audioData: string, language = 'en'): Promise<{
    text: string;
    language: string;
    duration: number;
  }> {
    try {
      // Convert base64 audio to file and transcribe using OpenAI's Whisper
      const transcription = await this.openAIService.transcribeAudio(audioData);
      
      // Auto-detect language if possible based on the transcript
      let detectedLanguage = language;
      
      // In a more advanced implementation, we could use OpenAI to detect the language
      // For now, we'll stick with the provided language parameter
      
      return {
        text: transcription.text,
        language: detectedLanguage,
        duration: transcription.duration,
      };
    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async createRfqFromVoice(audioData: string, userId?: number, language = 'en'): Promise<{
    transcription: string;
    extractedRfq: RfqDetails;
    language: string;
    status: string;
    confidence: number;
  }> {
    try {
      // Step 1: Transcribe the audio
      const transcriptionResult = await this.transcribeAudio(audioData, language);
      
      // Step 2: Use AI to extract RFQ details from the transcription using the new helper method
      const systemPrompt = "You are an AI assistant that extracts structured RFQ information from voice transcriptions.";
      const prompt = `
        Extract detailed RFQ (Request for Quote) information from the following voice transcription:
        
        ${transcriptionResult.text}
        
        Format the response as a JSON object with the following fields:
        - productName: The name of the product or service being requested
        - quantity: The quantity requested (number or null)
        - specifications: Any technical specifications mentioned
        - deliveryDate: Any delivery date or timeline mentioned
        - budget: Any budget constraints or price expectations (number or null)
        - location: Delivery or service location
        - preferredSuppliers: Array of any preferred suppliers mentioned (or null)
        - urgency: Level of urgency ('low', 'medium', 'high', or null)
        - additionalRequirements: Any other requirements or special conditions
        - contactInfo: Object containing:
          - name: Contact person's name (or null)
          - email: Contact email (or null)
          - phone: Contact phone (or null)
        
        If any field is not present in the transcription, set it to null.
        Only extract information directly mentioned in the transcription.
      `;
      
      const extractedData = await this.openAIService.generateJsonCompletion(prompt, systemPrompt);
      
      // Ensure the result matches our RfqDetails interface
      const extractedRfq: RfqDetails = {
        productName: extractedData.productName || '',
        quantity: extractedData.quantity || null,
        specifications: extractedData.specifications || null,
        deliveryDate: extractedData.deliveryDate || null,
        budget: extractedData.budget || null,
        location: extractedData.location || null,
        preferredSuppliers: Array.isArray(extractedData.preferredSuppliers) 
          ? extractedData.preferredSuppliers 
          : null,
        urgency: (extractedData.urgency === 'low' || 
                 extractedData.urgency === 'medium' || 
                 extractedData.urgency === 'high') 
          ? extractedData.urgency 
          : null,
        additionalRequirements: extractedData.additionalRequirements || null,
        contactInfo: {
          name: extractedData.contactInfo?.name || null,
          email: extractedData.contactInfo?.email || null,
          phone: extractedData.contactInfo?.phone || null
        }
      };
      
      // Calculate confidence score based on how many fields were successfully extracted
      const totalFields = 10; // Total number of top-level fields we're trying to extract
      const filledFields = Object.entries(extractedRfq).filter(([_, value]) => {
        if (value === null) return false;
        if (typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(v => v === null)) return false;
        return true;
      }).length;
      
      const confidence = filledFields / totalFields;
      
      return {
        transcription: transcriptionResult.text,
        extractedRfq,
        language,
        status: 'completed',
        confidence,
      };
    } catch (error) {
      console.error('Error in createRfqFromVoice:', error);
      throw new Error('Failed to create RFQ from voice');
    }
  }

  async processVoiceCommand(audioData: string, language = 'en'): Promise<VoiceCommandResult> {
    try {
      // Step 1: Transcribe the audio
      const transcriptionResult = await this.transcribeAudio(audioData, language);
      const transcribedText = transcriptionResult.text.toLowerCase();
      
      // Step 2: Use AI to detect command intent and extract relevant parameters
      const systemPrompt = "You are an AI assistant that analyzes voice commands and extracts structured information.";
      const prompt = `
        Analyze the following voice command and categorize it:
        
        "${transcribedText}"
        
        Determine the primary intent of this command from one of these categories:
        - createRfq: Creating a new request for quotation
        - searchSupplier: Searching for suppliers or vendors
        - showStatus: Checking status of existing requests or orders
        - compareSuppliers: Comparing different suppliers
        - helpAssistant: Requesting help or instructions
        - other: Any other intent not listed above
        
        Extract any relevant parameters mentioned in the command.
        
        Format your response as a JSON object with the following fields:
        - intent: The detected intent category (string)
        - confidence: Your confidence in this classification from 0.0 to 1.0
        - parameters: An object containing any relevant parameters extracted from the command
        - reasoning: A brief explanation of how you determined this intent
      `;
      
      const result = await this.openAIService.generateJsonCompletion(prompt, systemPrompt);
      
      // Map the intent to our action categories
      let action = result.intent || 'unknown';
      
      // Check if we need to fall back to rule-based detection
      if (action === 'other' || result.confidence < 0.4) {
        // Fallback to our rule-based approach
        const commands = this.voiceCommands[language as keyof typeof this.voiceCommands] || this.voiceCommands['en'];
        
        // Identify command type from transcription
        Object.entries(commands).forEach(([actionKey, phrases]) => {
          (phrases as string[]).forEach((phrase: string) => {
            if (transcribedText.includes(phrase.toLowerCase())) {
              action = actionKey;
            }
          });
        });
      }
      
      return {
        command: transcribedText,
        action,
        parameters: result.parameters || {},
        success: action !== 'other' && action !== 'unknown',
        confidence: result.confidence || 0,
      };
    } catch (error) {
      console.error('Error in processVoiceCommand:', error);
      throw new Error('Failed to process voice command');
    }
  }

  async extractBusinessEntities(audioData: string, language = 'en'): Promise<{
    transcription: string;
    entities: {
      organizations: string[];
      products: string[];
      locations: string[];
      people: string[];
      dates: string[];
      amounts: string[];
    };
    language: string;
  }> {
    try {
      // Step 1: Transcribe the audio
      const transcriptionResult = await this.transcribeAudio(audioData, language);
      
      // Step 2: Extract business entities using OpenAI
      const entities = await this.openAIService.extractEntities(transcriptionResult.text, [
        'organizations', 'products', 'locations', 'people', 'dates', 'amounts'
      ]);
      
      // Ensure type safety by defining expected structure
      const typedEntities = {
        organizations: entities.entities.organizations || [],
        products: entities.entities.products || [],
        locations: entities.entities.locations || [],
        people: entities.entities.people || [],
        dates: entities.entities.dates || [],
        amounts: entities.entities.amounts || []
      };
      
      return {
        transcription: transcriptionResult.text,
        entities: typedEntities,
        language,
      };
    } catch (error) {
      console.error('Error in extractBusinessEntities:', error);
      throw new Error('Failed to extract business entities');
    }
  }

  async analyzeSentiment(audioData: string, language = 'en'): Promise<{
    transcription: string;
    sentiment: {
      rating: number;
      confidence: number;
      summary: string;
    };
    language: string;
  }> {
    try {
      // Step 1: Transcribe the audio
      const transcriptionResult = await this.transcribeAudio(audioData, language);
      
      // Step 2: Analyze sentiment
      const sentiment = await this.openAIService.analyzeSentiment(transcriptionResult.text);
      
      return {
        transcription: transcriptionResult.text,
        sentiment: {
          rating: sentiment.rating,
          confidence: sentiment.confidence,
          summary: sentiment.summary
        },
        language,
      };
    } catch (error) {
      console.error('Error in analyzeSentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  async getSupportedLanguages(): Promise<{
    languages: Array<{
      code: string;
      name: string;
    }>;
    defaultLanguage: string;
  }> {
    try {
      const languages = Object.entries(this.supportedLanguages).map(([code, name]) => ({
        code,
        name,
      }));
      
      return {
        languages,
        defaultLanguage: 'en',
      };
    } catch (error) {
      console.error('Error in getSupportedLanguages:', error);
      throw new Error('Failed to get supported languages');
    }
  }
}
