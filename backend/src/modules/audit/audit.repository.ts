import { Injectable } from '@nestjs/common';
import { ActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditReportFilters {
  search?: string;
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
}

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

  async findDetailedReport(filters: AuditReportFilters, skip: number, take: number) {
    const where = this.buildWhere(filters);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { name: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  async findDetailedReportForExport(filters: AuditReportFilters) {
    const where = this.buildWhere(filters);

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { name: true, email: true },
        },
      },
    });
  }

  private buildWhere(filters: AuditReportFilters): Prisma.AuditLogWhereInput {
    const whereClauses: Prisma.AuditLogWhereInput[] = [];

    if (filters.action) {
      whereClauses.push({ action: filters.action });
    }

    if (filters.actorId) {
      whereClauses.push({ actorId: filters.actorId });
    }

    if (filters.entityType) {
      whereClauses.push({
        entityType: {
          contains: filters.entityType,
          mode: 'insensitive',
        },
      });
    }

    if (filters.startDate || filters.endDate) {
      const createdAt: Prisma.DateTimeFilter = {};

      if (filters.startDate) {
        createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        createdAt.lte = filters.endDate;
      }

      whereClauses.push({ createdAt });
    }

    if (filters.search) {
      const normalizedSearch = filters.search.trim();
      const upperSearch = normalizedSearch.toUpperCase();
      const searchClauses: Prisma.AuditLogWhereInput[] = [
        {
          entityType: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
        {
          entityId: {
            contains: normalizedSearch,
            mode: 'insensitive',
          },
        },
        {
          actor: {
            is: {
              name: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          actor: {
            is: {
              email: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
          },
        },
      ];

      if (Object.values(ActionType).includes(upperSearch as ActionType)) {
        searchClauses.push({ action: upperSearch as ActionType });
      }

      whereClauses.push({ OR: searchClauses });
    }

    if (whereClauses.length === 0) {
      return {};
    }

    return { AND: whereClauses };
  }
}
