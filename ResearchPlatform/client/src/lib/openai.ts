import { apiRequest } from './queryClient';

export interface TranscriptionResult {
  text: string;
  duration: number;
  language: string;
}

export interface CommandResult {
  command: string;
  action: string;
  parameters: Record<string, any>;
  success: boolean;
  confidence: number;
}

export interface RfqResult {
  transcription: string;
  extractedRfq: {
    productName: string;
    quantity: string | number | null;
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
  };
  language: string;
  status: string;
  confidence: number;
}

export interface EntityExtractionResult {
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
}

export interface SentimentAnalysisResult {
  transcription: string;
  sentiment: {
    rating: number;
    confidence: number;
    summary: string;
  };
  language: string;
}

export interface Language {
  code: string;
  name: string;
}

export const transcribeVoiceAudio = async (
  audioData: string,
  language = 'en'
): Promise<TranscriptionResult> => {
  try {
    return await apiRequest('POST', '/api/voice/transcribe', {
      audioData,
      language,
    }).then(res => res.json());
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};

export const createRfqFromVoice = async (
  audioData: string,
  userId?: number,
  language = 'en'
): Promise<RfqResult> => {
  try {
    return await apiRequest('POST', '/api/voice/create-rfq', {
      audioData,
      userId,
      language,
    }).then(res => res.json());
  } catch (error) {
    console.error('Error creating RFQ from voice:', error);
    throw new Error('Failed to create RFQ from voice');
  }
};

export const processVoiceCommand = async (
  audioData: string,
  language = 'en'
): Promise<CommandResult> => {
  try {
    return await apiRequest('POST', '/api/voice/process-command', {
      audioData,
      language,
    }).then(res => res.json());
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw new Error('Failed to process voice command');
  }
};

export const getSupportedLanguages = async (): Promise<{
  languages: Language[];
  defaultLanguage: string;
}> => {
  try {
    return await apiRequest('GET', '/api/voice/supported-languages').then(res => res.json());
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    throw new Error('Failed to fetch supported languages');
  }
};

export const extractBusinessEntities = async (
  audioData: string,
  language = 'en'
): Promise<EntityExtractionResult> => {
  try {
    return await apiRequest('POST', '/api/voice/extract-entities', {
      audioData,
      language,
    }).then(res => res.json());
  } catch (error) {
    console.error('Error extracting entities:', error);
    throw new Error('Failed to extract business entities');
  }
};

export const analyzeSentiment = async (
  audioData: string,
  language = 'en'
): Promise<SentimentAnalysisResult> => {
  try {
    return await apiRequest('POST', '/api/voice/analyze-sentiment', {
      audioData,
      language,
    }).then(res => res.json());
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Failed to analyze sentiment');
  }
};

// Audio recording utility functions
export const startRecording = async (): Promise<MediaRecorder> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });
    
    mediaRecorder.start();
    
    // Store the audio chunks on the mediaRecorder instance for later access
    (mediaRecorder as any).audioChunks = audioChunks;
    
    return mediaRecorder;
  } catch (error) {
    console.error('Error starting recording:', error);
    throw new Error('Failed to start recording');
  }
};

export const stopRecording = (mediaRecorder: MediaRecorder): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const audioChunks = (mediaRecorder as any).audioChunks as Blob[];
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Extract the base64 part (remove the data URL prefix)
          const base64Audio = base64data.split(',')[1];
          resolve(base64Audio);
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release the microphone
        (mediaRecorder.stream as MediaStream).getTracks().forEach(track => track.stop());
      });
      
      mediaRecorder.stop();
    } catch (error) {
      reject(error);
    }
  });
};
