import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository'; // <-- Importe o arquivo novo

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository], // <-- Registre ele aqui
  exports: [UsersService, UsersRepository], // Exportar é útil caso o AuthModule precise dele depois
})
export class UsersModule {}