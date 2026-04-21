import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL não encontrada nas variáveis de ambiente.');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log('Conectando ao banco de dados...');
    try {
      await this.$connect();
      this.logger.log('Conexão com o banco de dados estabelecida com sucesso.');
    } catch (error) {
      this.logger.error('Falha ao conectar com o banco de dados.', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Desconectando do banco de dados...');
    await this.$disconnect();
    this.logger.log('Desconectado.');
  }
}
