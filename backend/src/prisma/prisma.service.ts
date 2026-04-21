import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const host = configService.get<string>('DB_HOST');
    const port = configService.get<number>('DB_PORT');
    const user = configService.get<string>('DB_USER');
    const password = configService.get<string>('DB_PASSWORD');
    const database = configService.get<string>('DB_NAME');

    if (!host || !port || !user || !password || !database) {
      throw new Error('Database connection details are not fully set in environment variables.');
    }

    
    const poolConfig = {
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 5,
      allowPublicKeyRetrieval: true, 
    };

    const adapter = new PrismaMariaDb(poolConfig);

    super({
      adapter,
    });
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
