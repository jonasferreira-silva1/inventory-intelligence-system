import { Request, Response } from 'express';
import db from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { calculateProductMetrics } from '../utils/business';

const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  categoryId: z.string().uuid('Categoria inválida'),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  costPrice: z.number().positive('Preço de custo deve ser positivo'),
  salePrice: z.number().positive('Preço de venda deve ser positivo')
});

const updateProductSchema = createProductSchema.partial();

export const createProduct = async (req: Request, res: Response) => {
  const data = createProductSchema.parse(req.body);

  // Verifica se código já existe
  const existingProduct = await db.oneOrNone(
    'SELECT id FROM products WHERE code = $1',
    [data.code]
  );

  if (existingProduct) {
    throw new AppError('Código do produto já existe', 400);
  }

  // Verifica se categoria existe
  const category = await db.oneOrNone(
    'SELECT id, name FROM categories WHERE id = $1',
    [data.categoryId]
  );

  if (!category) {
    throw new AppError('Categoria não encontrada', 404);
  }

  const product = await db.one(
    `INSERT INTO products (name, code, category_id, quantity, min_quantity, cost_price, sale_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING 
       id, name, code, category_id as "categoryId", quantity, min_quantity as "minQuantity",
       cost_price as "costPrice", sale_price as "salePrice",
       created_at as "createdAt", updated_at as "updatedAt"`,
    [
      data.name,
      data.code,
      data.categoryId,
      data.quantity,
      data.minQuantity,
      data.costPrice,
      data.salePrice
    ]
  );

  res.status(201).json({
    ...product,
    category
  });
};

export const getProducts = async (req: Request, res: Response) => {
  const { search, categoryId, lowStock, stagnant } = req.query;

  let query = `
    SELECT 
      p.*,
      c.id as category_id, c.name as category_name,
      m.id as last_exit_id, m.created_at as last_exit_date
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT id, created_at
      FROM movements
      WHERE product_id = p.id AND type = 'EXIT'
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 1;

  if (search) {
    query += ` AND (p.name ILIKE $${paramCount} OR p.code ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (categoryId) {
    query += ` AND p.category_id = $${paramCount}`;
    params.push(categoryId);
    paramCount++;
  }

  query += ` ORDER BY p.created_at DESC`;

  const products = await db.any(query, params);

  // Filtra produtos parados e estoque baixo se solicitado
  let filteredProducts = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    categoryId: p.category_id,
    category: p.category_id ? {
      id: p.category_id,
      name: p.category_name
    } : null,
    quantity: p.quantity,
    minQuantity: p.min_quantity,
    costPrice: parseFloat(p.cost_price),
    salePrice: parseFloat(p.sale_price),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    movements: p.last_exit_date ? [{
      id: p.last_exit_id,
      createdAt: p.last_exit_date,
      type: 'EXIT'
    }] : []
  }));

  if (lowStock === 'true') {
    filteredProducts = filteredProducts.filter((p: any) => 
      p.quantity <= p.minQuantity
    );
  }

  if (stagnant === 'true') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    filteredProducts = filteredProducts.filter((product: any) => {
      const lastExit = product.movements[0];
      if (!lastExit) return true;
      return new Date(lastExit.createdAt) < thirtyDaysAgo;
    });
  }

  // Adiciona métricas a cada produto
  const productsWithMetrics = filteredProducts.map((product: any) => {
    const totalSold = 0; // TODO: calcular total vendido
    const metrics = calculateProductMetrics(
      {
        quantity: product.quantity,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        lastExitDate: product.movements[0]?.createdAt || null
      },
      totalSold,
      product.quantity
    );

    return {
      ...product,
      metrics
    };
  });

  res.json(productsWithMetrics);
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await db.oneOrNone(
    `SELECT 
       p.*,
       c.id as category_id, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [id]
  );

  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Busca últimas movimentações
  const movements = await db.any(
    `SELECT 
       m.*,
       u.id as user_id, u.name as user_name, u.email as user_email
     FROM movements m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.product_id = $1
     ORDER BY m.created_at DESC
     LIMIT 10`,
    [id]
  );

  // Calcula total vendido
  const totalSoldResult = await db.oneOrNone(
    `SELECT COALESCE(SUM(quantity), 0) as total
     FROM movements
     WHERE product_id = $1 AND type = 'EXIT'`,
    [id]
  );

  const totalSold = totalSoldResult ? parseInt(totalSoldResult.total) : 0;

  // Busca última saída
  const lastExit = await db.oneOrNone(
    `SELECT created_at
     FROM movements
     WHERE product_id = $1 AND type = 'EXIT'
     ORDER BY created_at DESC
     LIMIT 1`,
    [id]
  );

  const metrics = calculateProductMetrics(
    {
      quantity: product.quantity,
      costPrice: parseFloat(product.cost_price),
      salePrice: parseFloat(product.sale_price),
      lastExitDate: lastExit ? lastExit.created_at : null
    },
    totalSold,
    product.quantity
  );

  res.json({
    id: product.id,
    name: product.name,
    code: product.code,
    categoryId: product.category_id,
    category: product.category_id ? {
      id: product.category_id,
      name: product.category_name
    } : null,
    quantity: product.quantity,
    minQuantity: product.min_quantity,
    costPrice: parseFloat(product.cost_price),
    salePrice: parseFloat(product.sale_price),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    movements: movements.map((m: any) => ({
      id: m.id,
      productId: m.product_id,
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
    metrics
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateProductSchema.parse(req.body);

  // Verifica se produto existe
  const existingProduct = await db.oneOrNone(
    'SELECT code FROM products WHERE id = $1',
    [id]
  );

  if (!existingProduct) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Se código foi alterado, verifica se já existe
  if (data.code && data.code !== existingProduct.code) {
    const codeExists = await db.oneOrNone(
      'SELECT id FROM products WHERE code = $1',
      [data.code]
    );

    if (codeExists) {
      throw new AppError('Código do produto já existe', 400);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.code) {
    updates.push(`code = $${paramCount++}`);
    values.push(data.code);
  }
  if (data.categoryId) {
    updates.push(`category_id = $${paramCount++}`);
    values.push(data.categoryId);
  }
  if (data.quantity !== undefined) {
    updates.push(`quantity = $${paramCount++}`);
    values.push(data.quantity);
  }
  if (data.minQuantity !== undefined) {
    updates.push(`min_quantity = $${paramCount++}`);
    values.push(data.minQuantity);
  }
  if (data.costPrice !== undefined) {
    updates.push(`cost_price = $${paramCount++}`);
    values.push(data.costPrice);
  }
  if (data.salePrice !== undefined) {
    updates.push(`sale_price = $${paramCount++}`);
    values.push(data.salePrice);
  }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  values.push(id);

  const product = await db.one(
    `UPDATE products
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING 
       id, name, code, category_id as "categoryId", quantity, min_quantity as "minQuantity",
       cost_price as "costPrice", sale_price as "salePrice",
       created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );

  // Busca categoria
  const category = await db.oneOrNone(
    'SELECT id, name FROM categories WHERE id = $1',
    [product.categoryId]
  );

  res.json({
    ...product,
    category
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await db.oneOrNone(
    'SELECT id FROM products WHERE id = $1',
    [id]
  );

  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  await db.none('DELETE FROM products WHERE id = $1', [id]);

  res.status(204).send();
};
