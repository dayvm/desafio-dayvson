import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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

  // Busca os logs mais recentes, já puxando o nome e email do usuário que fez a ação
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { name: true, email: true }, // Puxa os dados do usuário para a tabela do front-end
          },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { data, total };
  }
}