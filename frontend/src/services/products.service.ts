import { apiClient } from '../infrastructure/api/client';
import { Category } from './categories.service'; 

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categories: { category: Category }[];
  ownerId: string;
  owner?: {
    name: string;
    email?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productsService = {
  async findAll(params?: { page?: number; limit?: number; search?: string; categoryId?: string }): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get('/products', {
      params,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });
    return response.data;
  },

  async create(formData: FormData) {
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // NOVA FUNÇÃO: Edição de Produto
  async update(id: string, formData: FormData) {
    const response = await apiClient.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // NOVAS FUNÇÕES: Favoritos
  async favorite(id: string) {
    const response = await apiClient.post(`/products/${id}/favorite`);
    return response.data;
  },

  async unfavorite(id: string) {
    const response = await apiClient.delete(`/products/${id}/favorite`);
    return response.data;
  }
};