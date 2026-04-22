import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core'; // <-- Import necessário para a auditoria global
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesController } from './files.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { AdminModule } from './modules/admin/admin.module'; // <-- Import do Admin
import { AuditModule } from './modules/audit/audit.module'; // <-- Import da Auditoria
import { AuditInterceptor } from './modules/audit/audit.interceptor'; // <-- Import do Interceptor
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule, 
    UsersModule, 
    CategoriesModule, 
    ProductsModule,
    AdminModule, // <-- Módulo Admin ativado
    AuditModule, // <-- Módulo de Auditoria ativado
  ],
  controllers: [AppController, FilesController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor, // <-- Isso liga o "olho de Sauron" em TODAS as rotas do sistema
    },
  ],
})
export class AppModule {}