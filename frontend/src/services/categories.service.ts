import { apiClient } from '../infrastructure/api/client';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner?: {
    name: string;
    email: string;
  };
}

export const categoriesService = {
  async findAll(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  async create(data: { name: string; description?: string }) {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
