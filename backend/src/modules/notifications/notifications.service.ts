import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async create(data: { recipientId: string; actorId?: string; type?: string; entityType?: string; entityId?: string; title: string; message: string }) {
    return this.notificationsRepository.create(data);
  }

  async findMyNotifications(userId: string) {
    return this.notificationsRepository.findByRecipientId(userId);
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepository.markAsRead(id, userId);
    return { success: true, message: 'Notificação marcada como lida' };
  }
}