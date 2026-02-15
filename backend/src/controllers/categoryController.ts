import { Request, Response } from 'express';
import db from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional()
});

const updateCategorySchema = createCategorySchema.partial();

export const createCategory = async (req: Request, res: Response) => {
  const data = createCategorySchema.parse(req.body);

  // Verifica se nome já existe
  const existingCategory = await db.oneOrNone(
    'SELECT id FROM categories WHERE name = $1',
    [data.name]
  );

  if (existingCategory) {
    throw new AppError('Categoria já existe', 400);
  }

  const category = await db.one(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at as "createdAt", updated_at as "updatedAt"`,
    [data.name, data.description || null]
  );

  res.status(201).json(category);
};

export const getCategories = async (req: Request, res: Response) => {
  const categories = await db.any(
    `SELECT 
       c.*,
       COUNT(p.id) as product_count
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id
     GROUP BY c.id
     ORDER BY c.name ASC`
  );

  const result = categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    createdAt: cat.created_at,
    updatedAt: cat.updated_at,
    _count: {
      products: parseInt(cat.product_count)
    }
  }));

  res.json(result);
};

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await db.oneOrNone(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );

  if (!category) {
    throw new AppError('Categoria não encontrada', 404);
  }

  // Busca produtos da categoria
  const products = await db.any(
    `SELECT 
       p.*,
       c.id as category_id, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = $1`,
    [id]
  );

  res.json({
    id: category.id,
    name: category.name,
    description: category.description,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
    products: products.map((p: any) => ({
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
      updatedAt: p.updated_at
    }))
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateCategorySchema.parse(req.body);

  // Verifica se categoria existe
  const existingCategory = await db.oneOrNone(
    'SELECT name FROM categories WHERE id = $1',
    [id]
  );

  if (!existingCategory) {
    throw new AppError('Categoria não encontrada', 404);
  }

  // Se nome foi alterado, verifica se já existe
  if (data.name && data.name !== existingCategory.name) {
    const nameExists = await db.oneOrNone(
      'SELECT id FROM categories WHERE name = $1',
      [data.name]
    );

    if (nameExists) {
      throw new AppError('Categoria com este nome já existe', 400);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description || null);
  }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  values.push(id);

  const category = await db.one(
    `UPDATE categories
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, name, description, created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );

  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await db.oneOrNone(
    `SELECT c.id, COUNT(p.id) as product_count
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );

  if (!category) {
    throw new AppError('Categoria não encontrada', 404);
  }

  if (parseInt(category.product_count) > 0) {
    throw new AppError(
      'Não é possível excluir categoria com produtos associados',
      400
    );
  }

  await db.none('DELETE FROM categories WHERE id = $1', [id]);

  res.status(204).send();
};
