import axios from 'axios';

// 1. Apenas a configuração bruta do cliente HTTP fica aqui
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Intercepta todas as requisições ANTES delas saírem do Front-end
apiClient.interceptors.request.use((config) => {
  let token = null;

  // Garante que o código está rodando no navegador antes de tentar ler o document.cookie
  if (typeof document !== 'undefined') {
    // Busca especificamente o cookie com o nome 'token'
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (match) {
      token = match[2];
    }
  }

  // Se achou o token, injeta no cabeçalho de Autorização
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});