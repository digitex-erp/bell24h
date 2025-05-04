
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../server';

describe('API Integration Tests', () => {
  describe('Voice API', () => {
    it('should handle voice commands', async () => {
      const response = await request(app)
        .post('/api/voice/command')
        .send({ text: 'create rfq', language: 'en-US' });
      expect(response.status).toBe(200);
    });
  });

  describe('Beta Testing API', () => {
    it('should track beta testers', async () => {
      const response = await request(app)
        .post('/api/beta/track')
        .send({ userId: 1, type: 'supplier' });
      expect(response.status).toBe(200);
    });
  });

  describe('External APIs', () => {
    it('should validate GST', async () => {
      const response = await request(app)
        .post('/api/gst/validate')
        .send({ gstNumber: 'TEST123' });
      expect(response.status).toBe(200);
    });
  });
});
