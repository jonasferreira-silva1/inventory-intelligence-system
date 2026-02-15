import api from './client';

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

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard');
    return response.data;
  },
};

