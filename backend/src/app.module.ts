import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module'; // <-- Adicionado!

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule, // <-- O Prisma agora é injetado globalmente
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}