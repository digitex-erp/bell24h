import { Router } from 'express';
import { authenticate, requireAuth } from '../middleware/auth';
import { register, login, getCurrentUser } from './auth';
import { getAllRfqs, getUserRfqs, getRfqById, createRfq } from './rfq';
import { processVoiceSubmission, createVoiceRfq, upload } from './voiceRfq';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, getCurrentUser);

// RFQ routes
router.get('/rfqs', getAllRfqs);
router.get('/rfqs/my', requireAuth, getUserRfqs);
router.get('/rfqs/:id', getRfqById);
router.post('/rfqs', requireAuth, createRfq);

// Voice RFQ routes
router.post('/rfqs/voice', upload.single('audio'), processVoiceSubmission);
router.post('/rfqs/voice/create', requireAuth, createVoiceRfq);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;