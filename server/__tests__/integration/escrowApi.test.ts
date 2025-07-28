import request from 'supertest';
// Adjust the import below to your actual Express app entry point
import app from '../../app';

describe('Escrow API Integration', () => {
  let buyerId = 'buyer-test-id';
  let sellerId = 'seller-test-id';
  let walletId = 'wallet-test-id';

  it('should create an escrow hold successfully', async () => {
    const res = await request(app)
      .post('/api/escrow/hold')
      .send({
        walletId,
        amount: 1000,
        currency: 'INR',
        gateway: 'RAZORPAY',
        buyerId,
        sellerId
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('status');
  });

  it('should fail if walletId is missing', async () => {
    const res = await request(app)
      .post('/api/escrow/hold')
      .send({
        amount: 1000,
        currency: 'INR',
        gateway: 'RAZORPAY',
        buyerId,
        sellerId
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should release an escrow hold', async () => {
    const res = await request(app)
      .post('/api/escrow/release')
      .send({ escrowId: 'test-escrow-id', userId: buyerId });
    // Accept 200 or 201 depending on implementation
    expect([200, 201]).toContain(res.status);
    // Should have id and status in response if successful
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');
    }
  });

  it('should refund an escrow hold', async () => {
    const res = await request(app)
      .post('/api/escrow/refund')
      .send({ escrowId: 'test-escrow-id', userId: buyerId });
    expect([200, 201]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');
    }
  });

  it('should fail for unauthorized escrow release', async () => {
    const res = await request(app)
      .post('/api/escrow/release')
      .send({ escrowId: 'test-escrow-id', userId: 'unauthorized-user' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should fail with invalid escrowId', async () => {
    const res = await request(app)
      .post('/api/escrow/release')
      .send({ escrowId: '', userId: 'buyer-test-id' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
