
import { beforeAll, afterAll } from 'vitest';
import { db } from '../server/db';
import { redis } from '../server/storage';
import { setupMockServices } from './utils/mock-services';
import { setupTestDb } from './utils/db-setup';
import { setupExternalAPIs } from './utils/external-api-setup';
import { setupVoiceTestHelpers } from './utils/voice-test-helpers';
import { setupBlockchainMocks } from './utils/blockchain-mocks';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

beforeAll(async () => {
  logger.info('Setting up test environment');
  await setupTestDb();
  await setupMockServices();
  await setupExternalAPIs();
  await setupVoiceTestHelpers();
  await setupBlockchainMocks();
});

afterAll(async () => {
  logger.info('Tearing down test environment');
  await redis.quit();
  await db.$disconnect();
});
