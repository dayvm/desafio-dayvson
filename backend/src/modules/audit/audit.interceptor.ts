import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AUDIT_ACTION_KEY } from '../../common/decorators/audit-action.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, body, params, ip, user } = req;

    // Ignora requisições de leitura, pois não alteram o banco
    if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Pega a ação customizada (se existir o decorator @AuditAction)
        let action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());

        // Ação padrão caso não tenha decorator
        if (!action) {
          if (method === 'POST') action = 'CREATE';
          else if (method === 'PATCH' || method === 'PUT') action = 'UPDATE';
          else if (method === 'DELETE') action = 'DELETE';
          else return; // <- Em vez de 'UNKNOWN', ele apenas encerra e não grava log.
        }

        // Pega a rota base para saber qual é a entidade (ex: /categories -> CATEGORIES)
        const urlParts = originalUrl.split('?')[0].split('/').filter(p => p && p !== 'api');
        const entityType = urlParts.length > 0 ? urlParts[0].toUpperCase() : 'UNKNOWN';
        
        // Tenta pegar o ID do registro que foi alterado
        const entityId = params.id || (response && response.id) || null;

        // Limpa dados sensíveis do body antes de gravar no banco
        const safeBody = { ...body };
        delete safeBody.password;
        delete safeBody.file;

        // Junta os detalhes da requisição para o campo JSON 'metadata'
        const metadata = {
          details: Object.keys(safeBody).length > 0 ? safeBody : null,
          ipAddress: ip || null,
        };

        // Identifica o usuário (pode vir como userId ou sub no token)
        const actorId = user?.userId || user?.sub || null;

        // Chama o Service para salvar no banco
        await this.auditService.logAction(actorId, action, entityType, entityId, metadata);
      }),
    );
  }
}