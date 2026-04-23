import { ActionType } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AuditReportFilters, AuditRepository } from './audit.repository';

interface AuditReportQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  // Essa é a exata função que o Interceptor está chamando
  async logAction(actorId: string, action: string, entityType: string, entityId: string, metadata?: any) {
    try {
      await this.auditRepository.createLog({ actorId, action, entityType, entityId, metadata });
    } catch (error) {
      // Se der erro ao salvar o log, logamos no console do servidor, mas não quebramos a requisição do usuário
      console.error('Falha silenciosa ao registrar log de auditoria:', error);
    }
  }
  
  async getLogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.auditRepository.findAll(skip, limit);
  }

  async getDetailedReport(query: AuditReportQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const filters = this.buildFilters(query);
    const { data, total } = await this.auditRepository.findDetailedReport(filters, skip, limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 1 : Math.ceil(total / limit),
      },
    };
  }

  async exportDetailedReportCsv(query: AuditReportQuery) {
    const filters = this.buildFilters(query);
    const rows = await this.auditRepository.findDetailedReportForExport(filters);
    const headers = [
      'id',
      'data_hora',
      'acao',
      'entidade',
      'registro_id',
      'usuario_nome',
      'usuario_email',
      'metadata',
    ];

    const lines = rows.map((row) =>
      [
        row.id,
        row.createdAt.toISOString(),
        row.action,
        row.entityType ?? '',
        row.entityId ?? '',
        row.actor?.name ?? '',
        row.actor?.email ?? '',
        row.metadata ? JSON.stringify(row.metadata) : '',
      ]
        .map((value) => this.escapeCsvValue(value))
        .join(','),
    );

    return `\uFEFF${[headers.join(','), ...lines].join('\n')}`;
  }

  private buildFilters(query: AuditReportQuery): AuditReportFilters {
    return {
      search: query.search?.trim() || undefined,
      action: query.action,
      entityType: query.entityType?.trim() || undefined,
      actorId: query.actorId,
      startDate: this.parseDateBoundary(query.startDate, 'start'),
      endDate: this.parseDateBoundary(query.endDate, 'end'),
    };
  }

  private parseDateBoundary(value: string | undefined, boundary: 'start' | 'end') {
    if (!value?.trim()) {
      return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const suffix = boundary === 'start' ? 'T00:00:00.000' : 'T23:59:59.999';
      return new Date(`${value}${suffix}`);
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  private escapeCsvValue(value: unknown) {
    const stringValue =
      typeof value === 'string'
        ? value
        : value === null || value === undefined
          ? ''
          : String(value);

    return `"${stringValue.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  }
}
