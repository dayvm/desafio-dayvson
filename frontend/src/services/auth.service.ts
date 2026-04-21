import { apiClient } from '../infrastructure/api/client';

// Tipamos o que o serviço espera receber da tela
export interface LoginCredentials {
  email: string;
  senha?: string;
}

export const authService = {
  // O método login esconde a complexidade da URL e do mapeamento de dados
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      // O front usa "senha" por causa do Zod, mas o back espera "password"
      // Fazemos essa tradução (mapeamento) aqui no serviço, deixando a tela limpa!
      password: credentials.senha, 
    });
    
    return response.data;
  }
};