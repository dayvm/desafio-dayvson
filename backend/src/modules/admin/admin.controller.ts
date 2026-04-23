import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client'; // <-- Importe o Role do Prisma
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Ajustado caminho relativo
import { RolesGuard } from '../../auth/guards/roles.guard'; // <-- Importe o guard de roles
import { Roles } from '../../auth/decorators/roles.decorator'; // <-- Importe o decorator
import { AuditReportQueryDto } from './dto/audit-report-query.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard) // <-- Adicione o RolesGuard aqui
@Roles(Role.ADMIN) // <-- BLINDAGEM: Apenas ADMIN entra neste controller inteiro
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  @Get('summary')
  getSummary() {
    return this.adminService.getSummary();
  }

  @Get('audit-logs')
  getAuditLogs(@Query() query: PaginationQueryDto) {
    return this.auditService.getLogs(query.page, query.limit);
  }

  @Get('audit-reports')
  getAuditReports(@Query() query: AuditReportQueryDto) {
    return this.auditService.getDetailedReport(query);
  }

  @Get('audit-reports/export')
  async exportAuditReports(
    @Query() query: AuditReportQueryDto,
    @Res() response: Response,
  ) {
    const csvContent = await this.auditService.exportDetailedReportCsv(query);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio-auditoria-${timestamp}.csv"`,
    );
    response.send(csvContent);
  }
}
