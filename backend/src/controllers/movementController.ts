import { Request, Response } from 'express';
import db from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { validateStockAvailability } from '../utils/business';
import { z } from 'zod';
import { runAllAlertChecks } from '../services/alertService';

const createMovementSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  type: z.enum(['ENTRY', 'EXIT']),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  reason: z.string().optional()
});

export const createMovement = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const data = createMovementSchema.parse(req.body);

  // Busca produto
  const product = await db.oneOrNone(
    'SELECT * FROM products WHERE id = $1',
    [data.productId]
  );

  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Valida estoque para saída
  if (data.type === 'EXIT') {
    validateStockAvailability(product.quantity, data.quantity);
  }

  // Cria movimentação
  const movement = await db.one(
    `INSERT INTO movements (product_id, type, quantity, reason, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING 
       id, product_id as "productId", type, quantity, reason, 
       user_id as "userId", created_at as "createdAt"`,
    [data.productId, data.type, data.quantity, data.reason || null, userId]
  );

  // Atualiza quantidade do produto
  const newQuantity = data.type === 'ENTRY'
    ? product.quantity + data.quantity
    : product.quantity - data.quantity;

  await db.none(
    'UPDATE products SET quantity = $1 WHERE id = $2',
    [newQuantity, data.productId]
  );

  // Busca dados completos para resposta
  const productData = await db.oneOrNone(
    `SELECT 
       p.*,
       c.id as category_id, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [data.productId]
  );

  const userData = await db.oneOrNone(
    'SELECT id, name, email FROM users WHERE id = $1',
    [userId]
  );

  // Verifica alertas após movimentação
  await runAllAlertChecks().catch(console.error);

  res.status(201).json({
    id: movement.id,
    productId: movement.productId,
    product: productData ? {
      id: productData.id,
      name: productData.name,
      code: productData.code,
      category: productData.category_id ? {
        id: productData.category_id,
        name: productData.category_name
      } : null
    } : null,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    userId: movement.userId,
    user: userData ? {
      id: userData.id,
      name: userData.name,
      email: userData.email
    } : null,
    createdAt: movement.createdAt
  });
};

export const getMovements = async (req: Request, res: Response) => {
  const { productId, type, startDate, endDate, page = '1', limit = '50' } = req.query;

  let query = `
    SELECT 
      m.*,
      p.id as product_id, p.name as product_name, p.code as product_code,
      c.id as category_id, c.name as category_name,
      u.id as user_id, u.name as user_name, u.email as user_email
    FROM movements m
    LEFT JOIN products p ON m.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON m.user_id = u.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 1;

  if (productId) {
    query += ` AND m.product_id = $${paramCount++}`;
    params.push(productId);
  }

  if (type) {
    query += ` AND m.type = $${paramCount++}`;
    params.push(type);
  }

  if (startDate) {
    query += ` AND m.created_at >= $${paramCount++}`;
    params.push(new Date(startDate as string));
  }

  if (endDate) {
    query += ` AND m.created_at <= $${paramCount++}`;
    params.push(new Date(endDate as string));
  }

  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  const offset = (pageNumber - 1) * limitNumber;

  query += ` ORDER BY m.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(limitNumber, offset);

  const movements = await db.any(query, params);

  // Conta total
  let countQuery = 'SELECT COUNT(*) as total FROM movements WHERE 1=1';
  const countParams: any[] = [];
  let countParamCount = 1;

  if (productId) {
    countQuery += ` AND product_id = $${countParamCount++}`;
    countParams.push(productId);
  }
  if (type) {
    countQuery += ` AND type = $${countParamCount++}`;
    countParams.push(type);
  }
  if (startDate) {
    countQuery += ` AND created_at >= $${countParamCount++}`;
    countParams.push(new Date(startDate as string));
  }
  if (endDate) {
    countQuery += ` AND created_at <= $${countParamCount++}`;
    countParams.push(new Date(endDate as string));
  }

  const totalResult = await db.one(countQuery, countParams);
  const total = parseInt(totalResult.total);

  res.json({
    movements: movements.map((m: any) => ({
      id: m.id,
      productId: m.product_id,
      product: m.product_id ? {
        id: m.product_id,
        name: m.product_name,
        code: m.product_code,
        category: m.category_id ? {
          id: m.category_id,
          name: m.category_name
        } : null
      } : null,
      type: m.type,
      quantity: m.quantity,
      reason: m.reason,
      userId: m.user_id,
      user: m.user_id ? {
        id: m.user_id,
        name: m.user_name,
        email: m.user_email
      } : null,
      createdAt: m.created_at
    })),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber)
    }
  });
};

export const getMovement = async (req: Request, res: Response) => {
  const { id } = req.params;

  const movement = await db.oneOrNone(
    `SELECT 
       m.*,
       p.id as product_id, p.name as product_name, p.code as product_code,
       c.id as category_id, c.name as category_name,
       u.id as user_id, u.name as user_name, u.email as user_email
     FROM movements m
     LEFT JOIN products p ON m.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.id = $1`,
    [id]
  );

  if (!movement) {
    throw new AppError('Movimentação não encontrada', 404);
  }

  res.json({
    id: movement.id,
    productId: movement.product_id,
    product: movement.product_id ? {
      id: movement.product_id,
      name: movement.product_name,
      code: movement.product_code,
      category: movement.category_id ? {
        id: movement.category_id,
        name: movement.category_name
      } : null
    } : null,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    userId: movement.user_id,
    user: movement.user_id ? {
      id: movement.user_id,
      name: movement.user_name,
      email: movement.user_email
    } : null,
    createdAt: movement.created_at
  });
};
