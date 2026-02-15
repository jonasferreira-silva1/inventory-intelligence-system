import api from './client';

export interface Product {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
  metrics?: {
    profitMargin: number;
    totalProfit: number;
    turnoverRate: number;
    isStagnant: boolean;
    daysWithoutMovement: number;
  };
}

export interface CreateProductData {
  name: string;
  code: string;
  categoryId: string;
  quantity?: number;
  minQuantity?: number;
  costPrice: number;
  salePrice: number;
}

export const productsApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: string;
    lowStock?: boolean;
    stagnant?: boolean;
  }): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

