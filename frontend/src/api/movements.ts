import api from './client';

export type MovementType = 'ENTRY' | 'EXIT';

export interface Movement {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    code: string;
    category?: {
      id: string;
      name: string;
    };
  };
  type: MovementType;
  quantity: number;
  reason?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateMovementData {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

export interface MovementsResponse {
  movements: Movement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const movementsApi = {
  getAll: async (params?: {
    productId?: string;
    type?: MovementType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<MovementsResponse> => {
    const response = await api.get<MovementsResponse>('/movements', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Movement> => {
    const response = await api.get<Movement>(`/movements/${id}`);
    return response.data;
  },

  create: async (data: CreateMovementData): Promise<Movement> => {
    const response = await api.post<Movement>('/movements', data);
    return response.data;
  },
};

