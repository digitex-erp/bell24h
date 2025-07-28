import request from 'supertest';
import app from '../../app';

describe('Wallet API Integration', () => {
  let userId = 'user-test-id';

  it('should create a new wallet', async () => {
    const res = await request(app)
      .post('/api/wallet')
      .send({
        userId,
        countryCode: 'IN',
        email: 'testuser@example.com',
        phone: '9999999999'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('currency', 'INR');
  });

  it('should fail if userId is missing', async () => {
    const res = await request(app)
      .post('/api/wallet')
      .send({
        countryCode: 'IN',
        email: 'testuser@example.com',
        phone: '9999999999'
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should fund a wallet', async () => {
    const res = await request(app)
      .post('/api/wallet/fund')
      .send({ walletId: 'test-wallet-id', amount: 500 });
    expect([200, 201]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('balance');
    }
  });

  it('should transfer funds between wallets', async () => {
    const res = await request(app)
      .post('/api/wallet/transfer')
      .send({ fromWalletId: 'wallet1', toWalletId: 'wallet2', amount: 200 });
    expect([200, 201]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');
    }
  });

  it('should fail for unauthorized wallet transfer', async () => {
    const res = await request(app)
      .post('/api/wallet/transfer')
      .send({ fromWalletId: 'wallet1', toWalletId: 'wallet2', amount: 200, userId: 'unauthorized-user' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should fail to transfer if insufficient funds', async () => {
    const res = await request(app)
      .post('/api/wallet/transfer')
      .send({ fromWalletId: 'wallet1', toWalletId: 'wallet2', amount: 1000000 });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
