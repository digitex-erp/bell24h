
import { FastifyInstance } from 'fastify';
import { db } from './db';
import { transactionSchema, escrowSchema } from '../shared/schema';
import { z } from 'zod';

export async function paymentRoutes(app: FastifyInstance) {
  // Calculate transaction fee
  app.post('/api/transaction-fee', async (req, reply) => {
    const body = z.object({
      amount: z.number(),
      type: z.string()
    }).parse(req.body);

    // Calculate fee based on transaction type and amount 
    const feePercentage = body.type === 'rfq' ? 0.02 : 0.01;
    const fee = body.amount * feePercentage;

    return { fee };
  });

  // Create escrow payment
  app.post('/api/escrow/create', async (req, reply) => {
    const body = escrowSchema.parse(req.body);
    
    const escrow = await db.insert('escrow').values({
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    }).returning();

    return escrow[0];
  });

  // Release escrow payment
  app.post('/api/escrow/:id/release', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const escrow = await db
      .update('escrow')
      .set({ status: 'released' })
      .where('id', '=', id)
      .returning();

    return escrow[0];
  });

  // Record transaction
  app.post('/api/transactions', async (req, reply) => {
    const body = transactionSchema.parse(req.body);
    
    const transaction = await db.insert('transactions').values({
      ...body,
      createdAt: new Date().toISOString()
    }).returning();

    return transaction[0];
  });
}
