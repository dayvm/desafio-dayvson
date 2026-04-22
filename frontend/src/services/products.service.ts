import { apiClient } from '../infrastructure/api/client';
import { Category } from './categories.service'; 

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price?: string | null; // Adicionado para suportar o preço futuramente
  categories: {
    name: string; category: Category 
}[]; // <-- O Prisma retorna a tabela pivô, então ajustamos a tipagem!
  ownerId: string;
  owner?: {
    name: string;
    email?: string;
  };
}

// Criamos uma interface para a resposta paginada oficial
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
  // Ajustado para retornar a interface de paginação
  async findAll(params?: { page?: number; limit?: number; search?: string; categoryId?: string }): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get('/products', {
      params, // Permite enviar page, limit e search via URL dinamicamente
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    // Fim da gambiarra. Retornamos o objeto exato que o back-end do NestJS gera.
    return response.data; 
  },

  async create(formData: FormData) {
    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};