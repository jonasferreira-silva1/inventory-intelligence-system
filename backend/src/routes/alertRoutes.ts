import { Router } from 'express';
import {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  checkAlerts,
  getUnreadAlertsCount
} from '../controllers/alertController';
import { authenticate } from '../middleware/auth';

export const alertRoutes = Router();

alertRoutes.use(authenticate);

alertRoutes.get('/', getAlerts);
alertRoutes.get('/unread/count', getUnreadAlertsCount);
alertRoutes.post('/check', checkAlerts);
alertRoutes.patch('/:id/read', markAlertAsRead);
alertRoutes.patch('/read-all', markAllAlertsAsRead);

