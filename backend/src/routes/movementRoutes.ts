import { Router } from 'express';
import {
  createMovement,
  getMovements,
  getMovement
} from '../controllers/movementController';
import { authenticate } from '../middleware/auth';

export const movementRoutes = Router();

movementRoutes.use(authenticate);

movementRoutes.post('/', createMovement);
movementRoutes.get('/', getMovements);
movementRoutes.get('/:id', getMovement);

