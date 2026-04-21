import { apiClient } from '../infrastructure/api/client';

// Tipagem do que esperamos receber do Back-end
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
  // Busca todas as categorias
  async findAll(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Cria uma nova categoria
  async create(data: { name: string; description?: string }) {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  // Deleta uma categoria
  async remove(id: string) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  }
};