import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client'; // <-- Importe o Role do Prisma
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Ajustado caminho relativo
import { RolesGuard } from '../../auth/guards/roles.guard'; // <-- Importe o guard de roles
import { Roles } from '../../auth/decorators/roles.decorator'; // <-- Importe o decorator
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
}