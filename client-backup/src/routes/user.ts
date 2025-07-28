import express from 'express';
import { Request, Response } from 'express';
import { db } from '../db';
import { User } from '../db/schema';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Configure Passport
passport.use(new LocalStrategy(
  async (email: string, password: string, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.email, email)
      });

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, id)
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

router.get('/profile', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  res.json(req.user);
});

export default router;
