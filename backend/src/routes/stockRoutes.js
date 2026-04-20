import { Router } from 'express';
import { getStocksOverview } from '../controllers/stockController.js';

export const stockRouter = Router();

stockRouter.get('/overview', getStocksOverview);
