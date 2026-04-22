import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';

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
}