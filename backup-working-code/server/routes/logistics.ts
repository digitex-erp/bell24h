import express from 'express';
import { LogisticsService } from '../services/logistics';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// POST /api/logistics/shiprocket/track
router.post('/shiprocket/track', authenticate, async (req, res) => {
  try {
    const { shipmentId } = req.body;
    const tracking = await LogisticsService.trackShiprocketShipment(shipmentId);
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track shipment' });
  }
});

// POST /api/logistics/real-time-updates (webhook)
router.post('/real-time-updates', async (req, res) => {
  try {
    await LogisticsService.handleRealTimeUpdate(req.body);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process real-time update' });
  }
});

export default router; 