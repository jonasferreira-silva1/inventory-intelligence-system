import { Request, Response } from 'express';
import { getDashboardStats } from '../services/dashboardService';

export const getDashboard = async (req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res.json(stats);
};

