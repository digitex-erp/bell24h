
import { FastifyInstance } from 'fastify';
import { db } from './db';
import { adPromotionSchema } from '../shared/schema';

export async function promotionRoutes(app: FastifyInstance) {
  // Create ad promotion
  app.post('/api/promotions', async (req, reply) => {
    const body = adPromotionSchema.parse(req.body);
    
    const promotion = await db.insert('promotions').values({
      ...body,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }).returning();

    return promotion[0];
  });

  // Get active promotions
  app.get('/api/promotions/active', async (req, reply) => {
    const promotions = await db
      .select()
      .from('promotions')
      .where('status', '=', 'active')
      .orderBy('createdAt', 'desc');

    return promotions;
  });

  // Update promotion status
  app.patch('/api/promotions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };

    const promotion = await db
      .update('promotions')
      .set({ status })
      .where('id', '=', id)
      .returning();

    return promotion[0];
  });
}
