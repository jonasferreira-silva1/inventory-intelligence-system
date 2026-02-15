import db from '../database/connection';
import { isProductStagnant, calculateProfitMargin } from '../utils/business';

interface AlertCheckResult {
  alertsCreated: number;
}

/**
 * Verifica e cria alertas para produtos com estoque baixo
 */
export const checkLowStockAlerts = async (): Promise<AlertCheckResult> => {
  const products = await db.any(
    `SELECT * FROM products WHERE quantity <= min_quantity`
  );

  let alertsCreated = 0;

  for (const product of products) {
    // Verifica se já existe alerta não lido para este produto
    const existingAlert = await db.oneOrNone(
      `SELECT id FROM alerts 
       WHERE product_id = $1 AND type = 'LOW_STOCK' AND is_read = false`,
      [product.id]
    );

    if (!existingAlert) {
      await db.none(
        `INSERT INTO alerts (product_id, type, message)
         VALUES ($1, 'LOW_STOCK', $2)`,
        [
          product.id,
          `Produto "${product.name}" está abaixo do estoque mínimo. Quantidade: ${product.quantity}, Mínimo: ${product.min_quantity}`
        ]
      );
      alertsCreated++;
    }
  }

  return { alertsCreated };
};

/**
 * Verifica e cria alertas para produtos parados
 */
export const checkStagnantProducts = async (
  daysThreshold: number = 30
): Promise<AlertCheckResult> => {
  // Busca produtos com última saída há mais de X dias
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

  let alertsCreated = 0;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysThreshold);

  for (const product of products) {
    const lastExitDate = product.last_exit_date 
      ? new Date(product.last_exit_date) 
      : null;

    if (isProductStagnant(lastExitDate, daysThreshold)) {
      const existingAlert = await db.oneOrNone(
        `SELECT id FROM alerts 
         WHERE product_id = $1 AND type = 'NO_MOVEMENT' AND is_read = false`,
        [product.id]
      );

      if (!existingAlert) {
        const days = lastExitDate
          ? Math.floor((Date.now() - lastExitDate.getTime()) / (1000 * 60 * 60 * 24))
          : 'muito tempo';

        await db.none(
          `INSERT INTO alerts (product_id, type, message)
           VALUES ($1, 'NO_MOVEMENT', $2)`,
          [
            product.id,
            `Produto "${product.name}" sem movimentação há ${days} dias. Considere promoção ou análise de demanda.`
          ]
        );
        alertsCreated++;
      }
    }
  }

  return { alertsCreated };
};

/**
 * Verifica oportunidades de lucro
 */
export const checkProfitOpportunities = async (): Promise<AlertCheckResult> => {
  const products = await db.any(
    `SELECT * FROM products WHERE quantity > 0`
  );

  let alertsCreated = 0;
  const minProfitMargin = 50; // Margem mínima de 50% para considerar oportunidade

  for (const product of products) {
    const profitMargin = calculateProfitMargin(
      parseFloat(product.cost_price),
      parseFloat(product.sale_price)
    );

    if (profitMargin >= minProfitMargin) {
      const existingAlert = await db.oneOrNone(
        `SELECT id FROM alerts 
         WHERE product_id = $1 AND type = 'PROFIT_OPPORTUNITY' AND is_read = false`,
        [product.id]
      );

      if (!existingAlert) {
        await db.none(
          `INSERT INTO alerts (product_id, type, message)
           VALUES ($1, 'PROFIT_OPPORTUNITY', $2)`,
          [
            product.id,
            `Produto "${product.name}" tem alta margem de lucro (${profitMargin.toFixed(2)}%). Considere aumentar o estoque.`
          ]
        );
        alertsCreated++;
      }
    }
  }

  return { alertsCreated };
};

/**
 * Executa todas as verificações de alertas
 */
export const runAllAlertChecks = async (): Promise<{
  lowStock: number;
  stagnant: number;
  profit: number;
  total: number;
}> => {
  const [lowStock, stagnant, profit] = await Promise.all([
    checkLowStockAlerts(),
    checkStagnantProducts(),
    checkProfitOpportunities()
  ]);

  return {
    lowStock: lowStock.alertsCreated,
    stagnant: stagnant.alertsCreated,
    profit: profit.alertsCreated,
    total: lowStock.alertsCreated + stagnant.alertsCreated + profit.alertsCreated
  };
};
