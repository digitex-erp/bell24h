import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import { voiceRoutes } from './voice-routes';
import { analyticsRoutes } from './analytics-routes';
import { paymentRoutes } from './payment-routes';

const app = fastify({ logger: true });

app.register(fastifyMultipart, {
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

app.register(voiceRoutes);
app.register(analyticsRoutes);
app.register(paymentRoutes);

const start = async () => {
  try {
    await app.listen({ port: 5000, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();