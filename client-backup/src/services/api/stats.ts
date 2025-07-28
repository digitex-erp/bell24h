import { api } from './api';

export interface Stats {
  activeSuppliers: number;
  activeRFQs: number;
  completedTransactions: number;
  totalUsers: number;
  totalQuotes: number;
  averageResponseTime: number;
  successRate: number;
}

export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api.get<Stats>('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return fallback data in case of error
    return {
      activeSuppliers: 0,
      activeRFQs: 0,
      completedTransactions: 0,
      totalUsers: 0,
      totalQuotes: 0,
      averageResponseTime: 0,
      successRate: 0,
    };
  }
}; 