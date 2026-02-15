import db from '../database/connection';
import { calculateProductMetrics } from '../utils/business';

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalStockValue: number;
  lowStockCount: number;
  stagnantProductsCount: number;
  totalMovements: number;
  movementsLast30Days: number;
  mostSoldProduct: {
    id: string;
    name: string;
    totalSold: number;
  } | null;
  mostProfitableProduct: {
    id: string;
    name: string;
    profitMargin: number;
    totalProfit: number;
  } | null;
  leastSoldProduct: {
    id: string;
    name: string;
    totalSold: number;
  } | null;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    totalValue: number;
  }>;
}

/**
 * Calcula estatísticas completas do dashboard
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Contagens básicas
  const [totalProducts, totalCategories] = await Promise.all([
    db.one('SELECT COUNT(*) as count FROM products').then((r: any) => parseInt(r.count)),
    db.one('SELECT COUNT(*) as count FROM categories').then((r: any) => parseInt(r.count))
  ]);

  // Produtos com estoque baixo
  const lowStockCount = await db.one(
    `SELECT COUNT(*) as count 
     FROM products 
     WHERE quantity <= min_quantity`
  ).then((r: any) => parseInt(r.count));

  // Valor total do estoque
  const stockValueResult = await db.one(
    `SELECT COALESCE(SUM(quantity * cost_price), 0) as total
     FROM products`
  );
  const totalStockValue = parseFloat(stockValueResult.total);

  // Produtos parados (sem saída há mais de 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stagnantProducts = await db.any(
    `SELECT p.id
     FROM products p
     LEFT JOIN LATERAL (
       SELECT created_at
       FROM movements
       WHERE product_id = p.id AND type = 'EXIT'
       ORDER BY created_at DESC
       LIMIT 1
     ) m ON true
     WHERE m.created_at IS NULL OR m.created_at < $1`,
    [thirtyDaysAgo]
  );
  const stagnantProductsCount = stagnantProducts.length;

  // Movimentações
  const [totalMovements, movementsLast30Days] = await Promise.all([
    db.one('SELECT COUNT(*) as count FROM movements').then((r: any) => parseInt(r.count)),
    db.one(
      'SELECT COUNT(*) as count FROM movements WHERE created_at >= $1',
      [thirtyDaysAgo]
    ).then((r: any) => parseInt(r.count))
  ]);

  // Produto mais vendido
  const mostSoldResult = await db.oneOrNone(
    `SELECT 
       product_id,
       SUM(quantity) as total_sold
     FROM movements
     WHERE type = 'EXIT'
     GROUP BY product_id
     ORDER BY total_sold DESC
     LIMIT 1`
  );

  let mostSoldProduct = null;
  if (mostSoldResult) {
    const product = await db.oneOrNone(
      'SELECT id, name FROM products WHERE id = $1',
      [mostSoldResult.product_id]
    );
    if (product) {
      mostSoldProduct = {
        id: product.id,
        name: product.name,
        totalSold: parseInt(mostSoldResult.total_sold)
      };
    }
  }

  // Produto menos vendido
  const leastSoldResult = await db.oneOrNone(
    `SELECT 
       product_id,
       SUM(quantity) as total_sold
     FROM movements
     WHERE type = 'EXIT'
     GROUP BY product_id
     ORDER BY total_sold ASC
     LIMIT 1`
  );

  let leastSoldProduct = null;
  if (leastSoldResult) {
    const product = await db.oneOrNone(
      'SELECT id, name FROM products WHERE id = $1',
      [leastSoldResult.product_id]
    );
    if (product) {
      leastSoldProduct = {
        id: product.id,
        name: product.name,
        totalSold: parseInt(leastSoldResult.total_sold)
      };
    }
  }

  // Produto mais lucrativo
  const products = await db.any(
    `SELECT 
       p.*,
       m.created_at as last_exit_date
     FROM products p
     LEFT JOIN LATERAL (
       SELECT created_at
       FROM movements
       WHERE product_id = p.id AND type = 'EXIT'
       ORDER BY created_at DESC
       LIMIT 1
     ) m ON true`
  );

  let mostProfitableProduct: {
    id: string;
    name: string;
    profitMargin: number;
    totalProfit: number;
  } | null = null;

  let maxProfit = -Infinity;

  for (const product of products) {
    const metrics = calculateProductMetrics(
      {
        quantity: product.quantity,
        costPrice: parseFloat(product.cost_price),
        salePrice: parseFloat(product.sale_price),
        lastExitDate: product.last_exit_date || null
      },
      0,
      0
    );

    if (metrics.totalProfit > maxProfit) {
      maxProfit = metrics.totalProfit;
      mostProfitableProduct = {
        id: product.id,
        name: product.name,
        profitMargin: metrics.profitMargin,
        totalProfit: metrics.totalProfit
      };
    }
  }

  // Estatísticas por categoria
  const categoryStats = await db.any(
    `SELECT 
       c.id as category_id,
       c.name as category_name,
       COUNT(p.id) as product_count,
       COALESCE(SUM(p.quantity * p.cost_price), 0) as total_value
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id
     GROUP BY c.id, c.name`
  );

  return {
    totalProducts,
    totalCategories,
    totalStockValue,
    lowStockCount,
    stagnantProductsCount,
    totalMovements,
    movementsLast30Days,
    mostSoldProduct,
    mostProfitableProduct,
    leastSoldProduct,
    categoryStats: categoryStats.map((cat: any) => ({
      categoryId: cat.category_id,
      categoryName: cat.category_name,
      productCount: parseInt(cat.product_count),
      totalValue: parseFloat(cat.total_value)
    }))
  };
};
