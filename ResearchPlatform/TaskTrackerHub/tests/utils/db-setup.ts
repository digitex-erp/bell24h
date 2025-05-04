
import { storage } from '../../server/storage';

export async function setupTestDb() {
  // Setup test database
  await storage.init();
  await storage.clearAllTables();
}
