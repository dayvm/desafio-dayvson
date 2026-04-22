import { Controller, Get, Patch, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ROTA: GET /notifications -> Lista as notificações do usuário logado
  @Get()
  findMine(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.notificationsService.findMyNotifications(userId);
  }

  // ROTA: PATCH /notifications/:id/read -> Marca como lida
  @Patch(':id/read')
  markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Request() req: any
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.notificationsService.markAsRead(id, userId);
  }
}