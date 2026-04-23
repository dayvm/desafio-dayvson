import { apiClient } from '../infrastructure/api/client';

export interface AuditReportEntry {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
  actor: {
    name: string | null;
    email: string;
  };
}

export interface AuditReportResponse {
  data: AuditReportEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditReportQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

function normalizeQuery(query: AuditReportQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  );
}

export const auditReportsService = {
  async getReport(query: AuditReportQuery): Promise<AuditReportResponse> {
    const response = await apiClient.get('/admin/audit-reports', {
      params: normalizeQuery(query),
    });

    return response.data;
  },

  async downloadCsv(query: AuditReportQuery): Promise<Blob> {
    const response = await apiClient.get('/admin/audit-reports/export', {
      params: normalizeQuery(query),
      responseType: 'blob',
    });

    return response.data as Blob;
  },
};
