import { apiClient } from '../infrastructure/api/client';

export interface AdminSummary {
  users: number;
  categories: number;
  products: number;
  favorites: number;
}

export const adminService = {
  async getSummary(): Promise<AdminSummary> {
    const response = await apiClient.get('/admin/summary');
    return response.data;
  }
};