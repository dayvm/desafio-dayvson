import { apiClient } from '../infrastructure/api/client';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface SaveUserPayload {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
}

export const usersService = {
  async findAll(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async create(data: SaveUserPayload) {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  async update(id: string, data: SaveUserPayload) {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { password: data.password } : {}),
    };

    const response = await apiClient.patch(`/users/${id}`, payload);
    return response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file); // O nome 'file' é obrigatório pois o back-end espera isso

    const response = await apiClient.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
