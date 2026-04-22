import { apiClient } from '../infrastructure/api/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  actorId?: string | null;
  type?: string;
  entityType?: string | null;
  entityId?: string | null;
}

export const notificationsService = {
  async getMine(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
};
