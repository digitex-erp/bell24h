
import { describe, it, expect } from 'vitest';
import { app } from '../../../server';
import request from 'supertest';

describe('Voice API Integration Tests', () => {
  it('should handle voice command transcription', async () => {
    const response = await request(app)
      .post('/api/voice/transcribe')
      .attach('audio', './tests/fixtures/test-audio.wav')
      .field('language', 'en-US');
    
    expect(response.status).toBe(200);
    expect(response.body.text).toBeDefined();
  });

  it('should process voice commands', async () => {
    const response = await request(app)
      .post('/api/voice/command')
      .send({
        text: 'create new RFQ',
        language: 'en-US'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.intent).toBe('create_rfq');
  });

  it('should support multiple languages', async () => {
    const response = await request(app)
      .post('/api/voice/transcribe')
      .attach('audio', './tests/fixtures/hindi-audio.wav')
      .field('language', 'hi-IN');
    
    expect(response.status).toBe(200);
    expect(response.body.language).toBe('hi-IN');
  });
});
