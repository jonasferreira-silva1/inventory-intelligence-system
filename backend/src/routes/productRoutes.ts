import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';

export const productRoutes = Router();

productRoutes.use(authenticate);

productRoutes.post('/', createProduct);
productRoutes.get('/', getProducts);
productRoutes.get('/:id', getProduct);
productRoutes.put('/:id', updateProduct);
productRoutes.delete('/:id', deleteProduct);

