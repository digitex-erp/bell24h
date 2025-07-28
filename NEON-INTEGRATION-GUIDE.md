# Bell24H Neon PostgreSQL Integration Guide

This guide explains how to integrate Neon serverless PostgreSQL with your existing Bell24H TypeScript application.

## 1. Setup & Testing

### Basic Connection Test

Run the connection test to verify your Neon database is accessible:

```bash
# Set up your .env file first (copy from .env.neon.example)
node test-neon-connection.js
```

### Standalone API Server

For testing or development, you can run the standalone Neon API server:

```bash
node neon-server.js
```

This provides endpoints for database health checks, schema exploration, and sample Bell24H-specific endpoints.

## 2. TypeScript Integration

### Option 1: Direct Integration with Bell24H Express Server

Add the following to your existing `server/db/client.ts` file:

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Configure Neon
neonConfig.fetchConnectionCache = true;

// Create SQL query function (for serverless environments)
export const sql = neon(process.env.DATABASE_URL!);

// Create connection pool (for traditional server environments)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper function to run queries with the pool
export async function query(text: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Export default based on environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
export default isServerless ? { sql } : { query, pool };
```

### Option 2: Service-Based Integration

Create a new service in `server/services/neon-db.ts`:

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Create SQL query function
const sql = neon(process.env.DATABASE_URL!);

/**
 * Neon Database Service
 * Provides methods for interacting with Neon PostgreSQL
 */
class NeonDatabaseService {
  /**
   * Execute a SQL query with parameters
   */
  async query(query: string, params: any[] = []) {
    try {
      // Convert to tagged template literal format
      return await sql([query], params);
    } catch (error) {
      console.error('Neon query error:', error);
      throw error;
    }
  }

  /**
   * Get supplier risk score
   */
  async getSupplierRiskScore(supplierId: number): Promise<number | null> {
    try {
      const result = await sql`
        SELECT risk_score FROM suppliers WHERE id = ${supplierId}
      `;
      return result.length > 0 ? result[0].risk_score : null;
    } catch (error) {
      console.error(`Error getting risk score for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const dbSize = await sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      
      const tableCount = await sql`
        SELECT count(*) as count FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      return {
        databaseSize: dbSize[0].size,
        tableCount: parseInt(tableCount[0].count),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }
}

export default new NeonDatabaseService();
```

## 3. API Integration

Add a new endpoint to your existing Express routes in `server/routes/index.ts`:

```typescript
import neonDbService from '../services/neon-db';

// In your registerRoutes function:
app.get(`${API_PATH}/database/stats`, async (req, res) => {
  try {
    const stats = await neonDbService.getDatabaseStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get database stats' });
  }
});

app.get(`${API_PATH}/supplier/:id/risk-score`, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID' });
    }
    
    const riskScore = await neonDbService.getSupplierRiskScore(supplierId);
    if (riskScore === null) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ supplierId, riskScore });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get supplier risk score' });
  }
});
```

## 4. Migration Strategy

### Migrating from Existing PostgreSQL

1. **Export your schema:**
   ```bash
   pg_dump --no-owner --no-acl --schema-only -d your_existing_db > schema.sql
   ```

2. **Export your data:**
   ```bash
   pg_dump --no-owner --no-acl --data-only -d your_existing_db > data.sql
   ```

3. **Import to Neon:**
   ```bash
   psql -h your-hostname.neon.tech -d your-database -U your-username -f schema.sql
   psql -h your-hostname.neon.tech -d your-database -U your-username -f data.sql
   ```

### Using with Drizzle ORM

If you're using Drizzle ORM in your Bell24H project, update your configuration:

```typescript
// server/db/index.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create the connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

## 5. Environment Configuration

Add these variables to your `.env` file:

```
# Neon PostgreSQL
DATABASE_URL=postgres://your-username:your-password@your-hostname.neon.tech/your-database

# Optional: Use Neon for specific features only (0 = disabled, 1 = enabled)
USE_NEON_FOR_ANALYTICS=1
USE_NEON_FOR_SUPPLIER_RISK=1
```

## 6. Performance Considerations

- **Connection Pooling:** For high-traffic applications, consider using Neon's connection pooling feature
- **Query Optimization:** Use prepared statements and indexes for optimal performance
- **Serverless Environments:** Use the `neon()` function directly
- **Traditional Servers:** Use the Pool from `pg` for connection management

## 7. Next Steps

- Implement a data synchronization strategy if using multiple databases
- Set up monitoring and logging for database performance
- Create database migration scripts specific to Neon
- Consider using Neon's branching feature for testing and development

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Node.js Serverless Driver](https://github.com/neondatabase/serverless)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/quick-postgresql/neon)
