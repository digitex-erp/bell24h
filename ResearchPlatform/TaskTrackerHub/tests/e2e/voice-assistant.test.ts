
import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceAssistant } from '../../client/src/components/voice/VoiceAssistant';
import { mockWebSpeechAPI } from '../utils/mock-web-speech';

describe('Voice Assistant E2E Tests', () => {
  let assistant: VoiceAssistant;

  beforeEach(() => {
    mockWebSpeechAPI();
    assistant = new VoiceAssistant();
  });

  it('should process voice commands', async () => {
    const result = await assistant.processCommand('create new RFQ');
    expect(result.understood).toBe(true);
    expect(result.intent).toBe('create_rfq');
  });

  it('should handle complex queries', async () => {
    const result = await assistant.processCommand('show me suppliers from Mumbai with 4+ rating');
    expect(result.understood).toBe(true);
    expect(result.filters).toEqual({
      location: 'Mumbai',
      minRating: 4
    });
  });

  it('should support multilingual commands', async () => {
    const result = await assistant.setLanguage('hi-IN');
    expect(result.supported).toBe(true);
    
    const command = await assistant.processCommand('नया RFQ बनाएं');
    expect(command.understood).toBe(true);
    expect(command.intent).toBe('create_rfq');
  });

  it('should handle voice recording errors', async () => {
    const result = await assistant.handleRecordingError('no_microphone');
    expect(result.errorHandled).toBe(true);
    expect(result.fallbackEnabled).toBe(true);
  });
});
