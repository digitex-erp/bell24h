import { Router } from 'express';
import * as globalTradeController from './global-trade.controller';

const router = Router();

// Country routes
router.get('/countries', globalTradeController.getAllCountries);
router.get('/countries/:id/trade-data', globalTradeController.getCountryTradeData);

// Industry routes
router.get('/industries', globalTradeController.getAllIndustries);
router.get('/industries/:id/trade-data', globalTradeController.getIndustryTradeData);

// SME specific routes
router.get('/industries/:id/sme-insights', globalTradeController.getSMETradeInsights);
router.get('/industries/:id/sme-trade-data', globalTradeController.getSMEImportExportData);

// Trade opportunities routes
router.get('/opportunities', globalTradeController.getTradeOpportunities);
router.post('/opportunities', globalTradeController.saveTradeOpportunity);

export default router;