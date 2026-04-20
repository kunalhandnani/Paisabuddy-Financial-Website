import { Router } from 'express';
import { loginUser } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/login', loginUser);
