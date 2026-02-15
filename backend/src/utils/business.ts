/**
 * Regras de Negócio e Cálculos Estratégicos
 */

export interface ProductMetrics {
  profitMargin: number;
  totalProfit: number;
  turnoverRate: number;
  isStagnant: boolean;
  daysWithoutMovement: number;
}

/**
 * Calcula a margem de lucro de um produto
 */
export const calculateProfitMargin = (costPrice: number, salePrice: number): number => {
  if (salePrice === 0) return 0;
  return ((salePrice - costPrice) / salePrice) * 100;
};

/**
 * Calcula o lucro total potencial
 */
export const calculateTotalProfit = (
  quantity: number,
  costPrice: number,
  salePrice: number
): number => {
  return quantity * (salePrice - costPrice);
};

/**
 * Calcula o giro de estoque
 * Giro = Quantidade Vendida / Estoque Médio
 */
export const calculateTurnoverRate = (
  totalSold: number,
  averageStock: number
): number => {
  if (averageStock === 0) return 0;
  return totalSold / averageStock;
};

/**
 * Verifica se um produto está parado
 * Produto parado = sem movimentação de saída há mais de X dias
 */
export const isProductStagnant = (
  lastMovementDate: Date | null,
  daysThreshold: number = 30
): boolean => {
  if (!lastMovementDate) return true;
  
  const daysSinceLastMovement = Math.floor(
    (Date.now() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastMovement > daysThreshold;
};

/**
 * Calcula dias sem movimentação
 */
export const getDaysWithoutMovement = (lastMovementDate: Date | null): number => {
  if (!lastMovementDate) return Infinity;
  
  return Math.floor(
    (Date.now() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Calcula todas as métricas de um produto
 */
export const calculateProductMetrics = (
  product: {
    quantity: number;
    costPrice: number;
    salePrice: number;
    lastExitDate?: Date | null;
  },
  totalSold: number = 0,
  averageStock: number = 0
): ProductMetrics => {
  const profitMargin = calculateProfitMargin(product.costPrice, product.salePrice);
  const totalProfit = calculateTotalProfit(
    product.quantity,
    product.costPrice,
    product.salePrice
  );
  const turnoverRate = calculateTurnoverRate(totalSold, averageStock);
  const daysWithoutMovement = getDaysWithoutMovement(product.lastExitDate || null);
  const isStagnant = isProductStagnant(product.lastExitDate || null);

  return {
    profitMargin,
    totalProfit,
    turnoverRate,
    isStagnant,
    daysWithoutMovement
  };
};

/**
 * Valida se há estoque suficiente para uma venda
 */
export const validateStockAvailability = (
  currentQuantity: number,
  requestedQuantity: number
): void => {
  if (currentQuantity < requestedQuantity) {
    throw new Error(
      `Estoque insuficiente. Disponível: ${currentQuantity}, Solicitado: ${requestedQuantity}`
    );
  }
};

