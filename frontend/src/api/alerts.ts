import api from './client';

export type AlertType = 'LOW_STOCK' | 'NO_MOVEMENT' | 'HIGH_DEMAND' | 'PROFIT_OPPORTUNITY';

export interface Alert {
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
  type: AlertType;
  message: string;
  isRead: boolean;
  userId?: string;
  createdAt: string;
}

export const alertsApi = {
  getAll: async (params?: {
    isRead?: boolean;
    type?: AlertType;
    productId?: string;
  }): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alerts', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/alerts/unread/count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Alert> => {
    const response = await api.patch<Alert>(`/alerts/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>('/alerts/read-all');
    return response.data;
  },

  check: async (): Promise<{
    lowStock: number;
    stagnant: number;
    profit: number;
    total: number;
  }> => {
    const response = await api.post<{
      lowStock: number;
      stagnant: number;
      profit: number;
      total: number;
    }>('/alerts/check');
    return response.data;
  },
};

