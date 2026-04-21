import { apiClient } from '../infrastructure/api/client';
import { Category } from './categories.service'; // Aproveitamos a tipagem que já criamos!

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categories: Category[]; // Relacionamento com as categorias
  ownerId: string;
  owner?: {
    name: string;
  };
}

export const productsService = {
  // Busca todos os produtos
  // Busca todos os produtos
  async findAll(): Promise<Product[]> {
    // 1. Adicionamos um header para forçar o navegador a não usar cache (evita o 304 falso)
    const response = await apiClient.get('/products', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    // 2. Se o Codex paginou e enviou { data: [...] }, nós extraímos o array. 
    // Se ele enviou o array direto, nós usamos ele mesmo.
    return response.data.data || response.data.items || response.data;
  },

  // Cria um produto enviando um FormData (Texto + Arquivo)
  async create(formData: FormData) {
    const response = await apiClient.post('/products', formData, {
      headers: {
        // O Axios normalmente descobre o boundary do multipart sozinho, 
        // mas é uma boa prática declarar quando usamos FormData explícito.
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Deleta um produto
  async remove(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};