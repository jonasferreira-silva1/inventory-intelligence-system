import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

export const categoryRoutes = Router();

categoryRoutes.use(authenticate);

categoryRoutes.post('/', createCategory);
categoryRoutes.get('/', getCategories);
categoryRoutes.get('/:id', getCategory);
categoryRoutes.put('/:id', updateCategory);
categoryRoutes.delete('/:id', deleteCategory);

