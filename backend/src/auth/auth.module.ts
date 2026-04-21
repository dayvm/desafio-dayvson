import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Importe o ConfigService
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Trocamos register por registerAsync
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => {
        // Agora ele espera o .env carregar com segurança
        const secret = configService.get<string>('JWT_SECRET');
        return {
          secret: secret || 'chave_super_secreta_para_desenvolvimento',
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}