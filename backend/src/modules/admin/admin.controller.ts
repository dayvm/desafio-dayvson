import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
// Importe o RolesGuard aqui depois para garantir que só ADMIN acessa essa rota

@UseGuards(JwtAuthGuard)
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
}