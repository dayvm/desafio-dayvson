import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: { actorId: string; action: string; entityType: string; entityId: string; metadata?: any }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action as ActionType,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || {}, // Salva os detalhes (como body e IP) em formato JSON
      }
    });
  }
}