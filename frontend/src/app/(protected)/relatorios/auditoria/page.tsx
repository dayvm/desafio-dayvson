'use client'

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Tag, Typography } from '@uigovpe/components';
import { authService } from '../../../../services/auth.service';
import {
  AuditReportEntry,
  AuditReportQuery,
  AuditReportResponse,
  auditReportsService,
} from '../../../../services/audit-reports.service';

type FilterState = {
  search: string;
  action: string;
  entityType: string;
  startDate: string;
  endDate: string;
};

const initialFilters: FilterState = {
  search: '',
  action: '',
  entityType: '',
  startDate: '',
  endDate: '',
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function getActionSeverity(action: string) {
  switch (action) {
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'info';
    case 'DELETE':
      return 'danger';
    default:
      return 'warning';
  }
}

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return 'Sem detalhes adicionais.';
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return String(metadata);
  }
}

export default function AuditoriaPage() {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [report, setReport] = useState<AuditReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadReport = async (page = 1, nextFilters: FilterState = filters) => {
    setIsLoading(true);

    try {
      const query: AuditReportQuery = {
        page,
        limit: 10,
        ...nextFilters,
      };

      const response = await auditReportsService.getReport(query);
      setReport(response);
      setFeedback(null);
    } catch (error) {
      console.error('Erro ao carregar relatório de auditoria:', error);
      setFeedback('Não foi possível carregar o relatório de auditoria.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const storedUser = authService.getStoredUser();

    if (storedUser?.role === 'ADMIN') {
      setCurrentRole(storedUser.role);
      loadReport(1, initialFilters);
      return () => {
        isMounted = false;
      };
    }

    if (storedUser) {
      setCurrentRole(storedUser.role);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    authService
      .getProfile()
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        setCurrentRole(profile.role);

        if (profile.role === 'ADMIN') {
          loadReport(1, initialFilters);
          return;
        }

        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadReport(1, filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    loadReport(1, initialFilters);
  };

  const handleChangePage = (nextPage: number) => {
    if (!report || nextPage < 1 || nextPage > report.meta.totalPages) {
      return;
    }

    loadReport(nextPage, filters);
  };

  const handleDownloadCsv = async () => {
    setIsExporting(true);

    try {
      const blob = await auditReportsService.downloadCsv(filters);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

      link.href = downloadUrl;
      link.download = `relatorio-auditoria-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setFeedback(null);
    } catch (error) {
      console.error('Erro ao exportar relatório de auditoria:', error);
      setFeedback('Não foi possível baixar o arquivo CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((value) => value !== '').length,
    [filters],
  );

  if (currentRole && currentRole !== 'ADMIN') {
    return (
      <Card>
        <div className="p-8 text-center">
          <Typography variant="h4" size="lg" fontWeight="bold">
            Acesso restrito
          </Typography>
          <Typography variant="p" className="mt-2 text-gray-500">
            Apenas administradores podem acessar os relatórios de auditoria.
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Typography variant="h3" size="xl" fontWeight="bold">
            Relatórios de Auditoria
          </Typography>
          <Typography variant="p" className="text-gray-500">
            Consulte quem fez cada ação, em qual entidade e em qual momento.
          </Typography>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button label="Aplicar filtros" onClick={handleApplyFilters} loading={isLoading} />
          <Button
            label="Limpar filtros"
            severity="secondary"
            outlined
            onClick={handleClearFilters}
          />
          <Button
            label="Baixar CSV"
            severity="secondary"
            onClick={handleDownloadCsv}
            loading={isExporting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="space-y-2 p-1">
            <Typography variant="p" className="text-sm text-gray-500">
              Registros filtrados
            </Typography>
            <Typography variant="h2" size="xl" fontWeight="bold">
              {report?.meta.total ?? 0}
            </Typography>
          </div>
        </Card>

        <Card>
          <div className="space-y-2 p-1">
            <Typography variant="p" className="text-sm text-gray-500">
              Página atual
            </Typography>
            <Typography variant="h2" size="xl" fontWeight="bold">
              {report?.meta.page ?? 1}
            </Typography>
          </div>
        </Card>

        <Card>
          <div className="space-y-2 p-1">
            <Typography variant="p" className="text-sm text-gray-500">
              Filtros ativos
            </Typography>
            <Typography variant="h2" size="xl" fontWeight="bold">
              {activeFiltersCount}
            </Typography>
          </div>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Busca</label>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => handleFilterChange('search', event.target.value)}
              placeholder="Nome, e-mail, entidade, ID ou ação"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ação</label>
            <select
              value={filters.action}
              onChange={(event) => handleFilterChange('action', event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              <option value="">Todas</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Entidade</label>
            <input
              type="text"
              value={filters.entityType}
              onChange={(event) => handleFilterChange('entityType', event.target.value)}
              placeholder="Ex: PRODUCTS"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Data inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => handleFilterChange('startDate', event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Data final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => handleFilterChange('endDate', event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </div>
        </div>
      </Card>

      {feedback ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {feedback}
        </div>
      ) : null}

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando registros de auditoria...</div>
        ) : !report || report.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum registro encontrado para os filtros informados.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 font-semibold text-gray-700">Quando</th>
                    <th className="p-4 font-semibold text-gray-700">Quem</th>
                    <th className="p-4 font-semibold text-gray-700">O que</th>
                    <th className="p-4 font-semibold text-gray-700">Entidade</th>
                    <th className="p-4 font-semibold text-gray-700">Registro</th>
                    <th className="p-4 font-semibold text-gray-700">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((entry: AuditReportEntry) => (
                    <tr key={entry.id} className="border-b border-gray-100 align-top">
                      <td className="p-4 text-sm text-gray-700">{formatDate(entry.createdAt)}</td>
                      <td className="p-4 text-sm text-gray-700">
                        <div className="font-medium text-gray-900">{entry.actor?.name || 'Sem nome'}</div>
                        <div>{entry.actor?.email || 'Sem e-mail'}</div>
                      </td>
                      <td className="p-4">
                        <Tag value={entry.action} severity={getActionSeverity(entry.action)} />
                      </td>
                      <td className="p-4 text-sm text-gray-700">{entry.entityType || '-'}</td>
                      <td className="p-4 text-sm text-gray-700">{entry.entityId || '-'}</td>
                      <td className="p-4 text-sm text-gray-700">
                        <details className="max-w-[320px]">
                          <summary className="cursor-pointer font-medium text-blue-700">
                            Ver detalhes
                          </summary>
                          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                            {formatMetadata(entry.metadata)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:flex-row">
              <Typography variant="p" className="text-sm text-gray-500">
                Página {report.meta.page} de {report.meta.totalPages} • {report.meta.total} registro(s)
              </Typography>

              <div className="flex gap-2">
                <Button
                  label="Anterior"
                  severity="secondary"
                  outlined
                  disabled={report.meta.page <= 1}
                  onClick={() => handleChangePage(report.meta.page - 1)}
                />
                <Button
                  label="Próxima"
                  severity="secondary"
                  outlined
                  disabled={report.meta.page >= report.meta.totalPages}
                  onClick={() => handleChangePage(report.meta.page + 1)}
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
