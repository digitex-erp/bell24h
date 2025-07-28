/**
 * Authentication routes for Bell24H Dashboard
 */
import { Request, Response, Router } from 'express';
import { db } from '../db';
import { users, createTokenPayload } from '../models/schema';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { passwordResetLimiter } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/auth';
import { validate } from '../../middleware/validateRequest';
import { asyncHandler } from '../../middleware/asyncHandler'; 
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../api/auth/auth.schema'; 
import { log } from '../utils';
import { sendEmail } from '../../utils/emailService';
import { getWelcomeEmailTemplate, getPasswordResetEmailTemplate } from '../../utils/emailTemplates';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bell24h-development-secret-key';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'; // Add this line

/**
 * User registration
 * POST /api/auth/register
 */
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name, role = 'user' } = req.body;
    
  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  
  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create user
  const [newUser] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: role === 'admin' ? 'user' : role, // Prevent admin role assignment via API
  }).returning();
  
  // Create token payload
  const tokenPayload = createTokenPayload(newUser);
  
  // Generate token
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  // Send welcome email
  try {
    const welcomeTemplate = getWelcomeEmailTemplate(name); 
    // await sendEmail({
    //   to: email, 
    //   subject: welcomeTemplate.subject,
    //   text: welcomeTemplate.text,
    //   html: welcomeTemplate.html,
    // });
    // log(`Welcome email sent to ${email}`, 'info');
    log(`DEBUG: Would send welcome email to ${email} with subject: ${welcomeTemplate.subject}`, 'info');
  } catch (emailError) {
    log(`Failed to send welcome email to ${email}: ${emailError}`, 'error');
  }

  // Return user info and token
  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },

    token,
  });
  
  log(`User registered: ${email} (${newUser.role})`, 'info');
} as express.RequestHandler);

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
    
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Find user
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const user = existingUser[0];
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create token payload
  const tokenPayload = createTokenPayload(user);
  
  // Generate token
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  // Set token as HTTP-only cookie
  setTokenCookie(res, token);

  // Return user info and token
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
  
  log(`User logged in: ${email} (${user.role})`, 'info');
} as express.RequestHandler);

/**
 * Get current user
 * GET /api/auth/user
 */
router.get('/user', requireAuth, (req: Request, res: Response) => {
  // User is already attached to request by requireAuth middleware
  res.json({
    user: {
      id: req.user?.id,
      username: req.user?.username,
      role: req.user?.role,
    }
  });
});

/**
 * Verify token
 * POST /api/auth/verify
 */
router.post('/verify', async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string, role: string };
    
    // Check if user still exists in database
    const existingUser = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (existingUser.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.json({ valid: false, error: 'Invalid token' });
  }
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', requireAuth, (req: Request, res: Response) => {
  if (!(req.user as User)) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Generate new token
  const token = jwt.sign(
    { id: req.user.id, username: req.user.username, role: req.user.role }, 
    JWT_SECRET, 
    { expiresIn: TOKEN_EXPIRY }
  );
  
  res.json({ token });
});

/**
 * Forgot password - request password reset
 * POST /api/auth/forgot-password
 * Rate limited to 5 requests per hour per IP
 */
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;
    
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) {
    // For security, don't reveal if the email exists or not
    return res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  // Update user with reset token and expiry
  // Create a dynamic update object to handle schema type safety
  const updateData: Record<string, any> = {};
  updateData[users.resetToken.name] = resetToken;
  updateData[users.resetTokenExpiry.name] = resetTokenExpiry.toISOString();
  
  await db.update(users)
    .set(updateData)
    .where(eq(users.id, user[0].id));

  // Send password reset email
  try {
    const emailTemplate = getPasswordResetEmailTemplate(user[0].name || 'User', resetToken);
    
    await sendEmail({
      to: user[0].email, 
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
    
    log(`Password reset email sent to ${user[0].email}`, 'info');
  } catch (emailError) {
    log(`Failed to send password reset email to ${user[0].email}: ${emailError}`, 'error');
  }

  res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
});

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, password } = req.body;
    
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  // Find user by reset token and check if it's still valid
  // Use dynamic property access for type safety
  const user = await db.select().from(users)
    .where(
      and(
        eq(users.resetToken as any, token),
        gt(users.resetTokenExpiry as any, new Date().toISOString())
      )
    )
    .limit(1);

  if (user.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update user's password and clear reset token
  // Create a dynamic update object to handle schema type safety
  const updateData: Record<string, any> = {};
  updateData[users.password.name] = hashedPassword;
  updateData[users.resetToken.name] = null;
  updateData[users.resetTokenExpiry.name] = null;
  
  await db.update(users)
    .set(updateData)
    .where(eq(users.id, user[0].id));

  res.json({ message: 'Password has been reset successfully' });
  
  log(`Password reset successful for user ${user[0].email}`, 'info');
});

export default router;
