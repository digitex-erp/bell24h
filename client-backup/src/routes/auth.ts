import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from '../server';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Passport local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user.length) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // TODO: Add proper password hashing
      if (user[0].password !== password) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      return done(null, user[0]);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user[0]);
  } catch (error) {
    done(error);
  }
});

// Routes
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const newUser = await db.insert(users).values({
      email,
      password, // TODO: Add password hashing
      name,
      role: 'user'
    }).returning();
    
    res.json({ user: newUser[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

export default router;
