import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { productRoutes } from './productRoutes';
import { categoryRoutes } from './categoryRoutes';
import { movementRoutes } from './movementRoutes';
import { alertRoutes } from './alertRoutes';
import { dashboardRoutes } from './dashboardRoutes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/products', productRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/movements', movementRoutes);
routes.use('/alerts', alertRoutes);
routes.use('/dashboard', dashboardRoutes);

