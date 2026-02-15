import { Request, Response } from 'express';
import db from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { runAllAlertChecks } from '../services/alertService';

export const getAlerts = async (req: Request, res: Response) => {
  const { isRead, type, productId } = req.query;

  let query = `
    SELECT 
      a.*,
      p.id as product_id, p.name as product_name, p.code as product_code,
      c.id as category_id, c.name as category_name,
      u.id as user_id, u.name as user_name, u.email as user_email
    FROM alerts a
    LEFT JOIN products p ON a.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 1;

  if (isRead !== undefined) {
    query += ` AND a.is_read = $${paramCount++}`;
    params.push(isRead === 'true');
  }

  if (type) {
    query += ` AND a.type = $${paramCount++}`;
    params.push(type);
  }

  if (productId) {
    query += ` AND a.product_id = $${paramCount++}`;
    params.push(productId);
  }

  query += ` ORDER BY a.created_at DESC`;

  const alerts = await db.any(query, params);

  res.json(alerts.map((a: any) => ({
    id: a.id,
    productId: a.product_id,
    product: a.product_id ? {
      id: a.product_id,
      name: a.product_name,
      code: a.product_code,
      category: a.category_id ? {
        id: a.category_id,
        name: a.category_name
      } : null
    } : null,
    type: a.type,
    message: a.message,
    isRead: a.is_read,
    userId: a.user_id,
    user: a.user_id ? {
      id: a.user_id,
      name: a.user_name,
      email: a.user_email
    } : null,
    createdAt: a.created_at
  })));
};

export const markAlertAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  const alert = await db.oneOrNone(
    'SELECT id FROM alerts WHERE id = $1',
    [id]
  );

  if (!alert) {
    throw new AppError('Alerta não encontrado', 404);
  }

  const updatedAlert = await db.one(
    `UPDATE alerts SET is_read = true WHERE id = $1
     RETURNING id, product_id as "productId", type, message, is_read as "isRead", 
               user_id as "userId", created_at as "createdAt"`,
    [id]
  );

  res.json(updatedAlert);
};

export const markAllAlertsAsRead = async (req: Request, res: Response) => {
  await db.none('UPDATE alerts SET is_read = true WHERE is_read = false');

  res.json({ message: 'Todos os alertas foram marcados como lidos' });
};

export const checkAlerts = async (req: Request, res: Response) => {
  const result = await runAllAlertChecks();
  res.json(result);
};

export const getUnreadAlertsCount = async (req: Request, res: Response) => {
  const result = await db.one(
    'SELECT COUNT(*) as count FROM alerts WHERE is_read = false'
  );

  res.json({ count: parseInt(result.count) });
};
