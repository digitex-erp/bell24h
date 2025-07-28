import request from 'supertest';
import app from '@/app';

describe('RFQ API', () => {
  it('POST /api/rfq creates RFQ', async () => {
    const testRFQ = {
      items: [{ product: 'Test Product', quantity: 10 }],
      deadline: new Date().toISOString()
    };
    
    const res = await request(app)
      .post('/api/rfq')
      .send(testRFQ);
      
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.items[0].product).toBe('Test Product');
  });

  it('returns 400 for invalid RFQ payload', async () => {
    const res = await request(app)
      .post('/api/rfq')
      .send({ invalid: 'payload' });
      
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
