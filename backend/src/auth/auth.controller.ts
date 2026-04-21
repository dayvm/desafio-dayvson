import { Controller, Post, Body, Get, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // Para retornar 200 em vez de 201 no POST
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    // Nota: Num cenário real, usaríamos um DTO (Data Transfer Object) validado com class-validator aqui
    return this.authService.login(signInDto.email, signInDto.password);
  }

  // A mágica acontece aqui: O @UseGuards barra qualquer um sem Token válido
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    // Se o token for válido, o NestJS injeta os dados do usuário dentro de "req.user"
    return req.user;
  }
}