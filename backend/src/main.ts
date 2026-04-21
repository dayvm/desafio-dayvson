import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3001', // A porta onde seu Next.js está rodando
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Importante se formos usar cookies no futuro
  });
  
  // Ativando a validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Arranca fora qualquer campo extra/malicioso que o front enviar e não estiver no DTO
      forbidNonWhitelisted: true, // Rejeita a requisição se vier campo extra
      transform: true, // Transforma os payloads nativamente para as instâncias das classes DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();