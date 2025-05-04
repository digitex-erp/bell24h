/**
 * API Routes for user role management
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

/**
 * Get all roles for the authenticated user
 */
router.get('/api/user/roles', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT role_type, is_primary FROM user_roles WHERE user_id = $1',
      [userId]
    );
    
    const roles = result.rows;
    res.json(roles);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

/**
 * Add a new role to the authenticated user
 */
router.post('/api/user/roles', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { roleType, isPrimary = false } = req.body;
    
    if (!roleType || !['buyer', 'supplier'].includes(roleType)) {
      return res.status(400).json({ error: 'Invalid role type. Must be "buyer" or "supplier".' });
    }
    
    // Check if the role already exists
    const existingRoleResult = await pool.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_type = $2',
      [userId, roleType]
    );
    
    if (existingRoleResult.rows.length > 0) {
      return res.status(400).json({ error: `User already has the ${roleType} role.` });
    }
    
    // If this is the primary role, unset any existing primary role
    if (isPrimary) {
      await pool.query(
        'UPDATE user_roles SET is_primary = false WHERE user_id = $1',
        [userId]
      );
    }
    
    // Insert the new role
    const result = await pool.query(
      'INSERT INTO user_roles (user_id, role_type, is_primary) VALUES ($1, $2, $3) RETURNING *',
      [userId, roleType, isPrimary]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user role:', error);
    res.status(500).json({ error: 'Failed to add user role' });
  }
});

/**
 * Update a user's role (e.g., make it primary)
 */
router.patch('/api/user/roles/:roleType', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { roleType } = req.params;
    const { isPrimary } = req.body;
    
    if (isPrimary === undefined) {
      return res.status(400).json({ error: 'isPrimary field is required' });
    }
    
    if (isPrimary) {
      // Unset any existing primary role
      await pool.query(
        'UPDATE user_roles SET is_primary = false WHERE user_id = $1',
        [userId]
      );
    }
    
    // Update the role
    const result = await pool.query(
      'UPDATE user_roles SET is_primary = $1 WHERE user_id = $2 AND role_type = $3 RETURNING *',
      [isPrimary, userId, roleType]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `User does not have the ${roleType} role.` });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * Delete a role from the authenticated user
 */
router.delete('/api/user/roles/:roleType', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { roleType } = req.params;
    
    // Check if this is the user's only role
    const rolesResult = await pool.query(
      'SELECT COUNT(*) FROM user_roles WHERE user_id = $1',
      [userId]
    );
    
    if (parseInt(rolesResult.rows[0].count) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only role. Users must have at least one role.' });
    }
    
    // Delete the role
    const result = await pool.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_type = $2 RETURNING *',
      [userId, roleType]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `User does not have the ${roleType} role.` });
    }
    
    // If the deleted role was primary, make another role primary
    if (result.rows[0].is_primary) {
      await pool.query(
        'UPDATE user_roles SET is_primary = true WHERE user_id = $1 LIMIT 1',
        [userId]
      );
    }
    
    res.json({ success: true, message: `${roleType} role removed successfully.` });
  } catch (error) {
    console.error('Error deleting user role:', error);
    res.status(500).json({ error: 'Failed to delete user role' });
  }
});

/**
 * Modified registration endpoint to support multiple roles
 */
router.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, companyName, roles, ...otherData } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !companyName || !roles || roles.length === 0) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Check if username already exists
    const userCheckResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (userCheckResult.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert the user with a default role temporarily (for compatibility)
      const defaultRole = roles[0]; // First role in the array becomes the default
      
      const userInsertResult = await client.query(
        `INSERT INTO users (
          username, password, email, company_name, location, industry, 
          gst_number, company_website, year_founded, employee_count, 
          contact_phone, contact_email, user_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          username, 
          password, // In production, this should be hashed
          email,
          companyName,
          otherData.address || null,
          otherData.industry || null,
          otherData.gstNumber || null,
          otherData.companyWebsite || null,
          otherData.yearFounded || null,
          otherData.employeeCount || null,
          otherData.companyPhone || null,
          email, // Use primary email as contact email
          defaultRole // For backward compatibility
        ]
      );
      
      const userId = userInsertResult.rows[0].id;
      
      // Insert user roles
      for (let i = 0; i < roles.length; i++) {
        const roleType = roles[i];
        const isPrimary = i === 0; // First role is primary
        
        await client.query(
          'INSERT INTO user_roles (user_id, role_type, is_primary) VALUES ($1, $2, $3)',
          [userId, roleType, isPrimary]
        );
      }
      
      // Insert buyer profile if user has buyer role
      if (roles.includes('buyer')) {
        await client.query(
          `INSERT INTO buyer_profiles (
            user_id, purchase_categories, annual_purchase_volume, preferred_supplier_regions
          ) VALUES ($1, $2, $3, $4)`,
          [
            userId,
            otherData.purchaseCategories ? JSON.stringify(otherData.purchaseCategories) : null,
            otherData.annualPurchaseVolume || null,
            otherData.preferredSupplierRegions ? JSON.stringify(otherData.preferredSupplierRegions) : null
          ]
        );
      }
      
      // Insert supplier profile if user has supplier role
      if (roles.includes('supplier')) {
        await client.query(
          `INSERT INTO suppliers (
            user_id, industry, description, sub_industries, products,
            service_areas, certifications, manufacturing_capacity
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            otherData.industry || null,
            otherData.businessDescription || null,
            otherData.subIndustries ? JSON.stringify(otherData.subIndustries) : null,
            otherData.productCategories ? JSON.stringify({categories: otherData.productCategories}) : null,
            otherData.exportMarkets ? JSON.stringify(otherData.exportMarkets) : null,
            otherData.certifications ? JSON.stringify(otherData.certifications) : null,
            otherData.annualProduction || null
          ]
        );
      }
      
      await client.query('COMMIT');
      
      // Don't return password in response
      const user = userInsertResult.rows[0];
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        ...userWithoutPassword,
        roles: roles.map((role, index) => ({
          role_type: role,
          is_primary: index === 0
        }))
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

module.exports = router;