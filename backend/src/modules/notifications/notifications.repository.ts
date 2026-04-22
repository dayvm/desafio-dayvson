import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Agora recebe todos os campos ricos do seu schema
  async create(data: { 
    recipientId: string; 
    actorId?: string; 
    type?: string; 
    entityType?: string; 
    entityId?: string; 
    title: string; 
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        actorId: data.actorId,
        type: data.type,
        entityType: data.entityType,
        entityId: data.entityId,
        title: data.title,
        message: data.message,
      }
    });
  }

  async findByRecipientId(recipientId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, recipientId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        id: id,
        recipientId: recipientId // Garante que o usuário só marque a própria notificação
      },
      data: {
        readAt: new Date(), // <-- Preenche com a data/hora atual em vez de true/false!
      }
    });
  }
}