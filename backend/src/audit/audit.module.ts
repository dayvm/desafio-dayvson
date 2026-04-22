import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { PrismaModule } from '../prisma/prisma.module'; // Verifique se o caminho para o PrismaModule está correto

@Module({
  imports: [PrismaModule],
  providers: [AuditService, AuditRepository],
  exports: [AuditService], // CRÍTICO: Exportar para o Interceptor poder usar
})
export class AuditModule {}