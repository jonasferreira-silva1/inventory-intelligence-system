import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/', getDashboard);

