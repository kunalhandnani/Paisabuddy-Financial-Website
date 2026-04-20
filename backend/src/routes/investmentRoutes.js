import { Router } from 'express';
import { createInvestment, getInvestments } from '../controllers/investmentController.js';

export const investmentRouter = Router();

investmentRouter.get('/', getInvestments);
investmentRouter.post('/', createInvestment);
