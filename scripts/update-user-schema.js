/**
 * Script to update user schema to support dual roles (buyer and supplier)
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create a PostgreSQL client
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function updateUserSchema() {
  console.log('Starting user schema update for dual roles...');
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if user_roles table exists
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_roles'
      );
    `);
    
    const tableExists = tableCheckResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating user_roles table...');
      
      // Create user_roles table
      await client.query(`
        CREATE TABLE user_roles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          role_type TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, role_type)
        )
      `);
      
      // Add index for faster lookups
      await client.query(`
        CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
      `);
      
      // Update users table to support multi-role functionality
      // Check if user_type column exists
      const columnCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'user_type'
        );
      `);
      
      if (columnCheckResult.rows[0].exists) {
        console.log('Migrating existing user_type values to user_roles table...');
        
        // Insert existing roles into user_roles table
        await client.query(`
          INSERT INTO user_roles (user_id, role_type, is_primary)
          SELECT id, user_type, true FROM users
          WHERE user_type IS NOT NULL;
        `);
      }
    } else {
      console.log('user_roles table already exists, skipping creation');
    }

    // Create buyer_profiles table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS buyer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        purchase_categories JSONB,
        annual_purchase_volume TEXT,
        preferred_supplier_regions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    // Update API functions to support dual roles
    // This is a function that will be used by the API to get user roles
    await client.query(`
      CREATE OR REPLACE FUNCTION get_user_roles(p_user_id INTEGER)
      RETURNS TABLE (role_type TEXT, is_primary BOOLEAN) AS $$
      BEGIN
        RETURN QUERY
        SELECT ur.role_type, ur.is_primary
        FROM user_roles ur
        WHERE ur.user_id = p_user_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Add helper function to check if user has a specific role
    await client.query(`
      CREATE OR REPLACE FUNCTION user_has_role(p_user_id INTEGER, p_role_type TEXT)
      RETURNS BOOLEAN AS $$
      DECLARE
        v_has_role BOOLEAN;
      BEGIN
        SELECT EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = p_user_id AND role_type = p_role_type
        ) INTO v_has_role;
        
        RETURN v_has_role;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('User schema updated successfully to support dual roles.');
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error updating user schema:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

// Execute the update
updateUserSchema()
  .then(() => {
    console.log('Schema update completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Schema update failed:', error);
    process.exit(1);
  });