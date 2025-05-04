
import { setupDb } from './utils/db-setup';
import { setupThirdPartyMocks } from './utils/third-party-mocks';
import { setupWebsocketServer } from './utils/test-helpers';

beforeAll(async () => {
  await setupDb();
  await setupThirdPartyMocks();
  await setupWebsocketServer();
});

afterAll(async () => {
  // Cleanup any test artifacts
  await setupDb().cleanup();
  await setupWebsocketServer().close();
});

beforeEach(() => {
  jest.clearAllMocks();
});
