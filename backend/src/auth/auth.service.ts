import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// Usaremos bcrypt para comparar a senha criptografada. 
// Como nosso seed inseriu a senha em texto puro, vou deixar uma comparação direta AQUI SÓ PARA TESTE, 
// mas o código comentado mostra como deve ser o fluxo real!
// import * as bcrypt from 'bcrypt'; 
import { PrismaService } from '../prisma/prisma.service'; // Ajuste o caminho

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // --- CUIDADO: CÓDIGO APENAS PARA O TESTE COM O SEED ATUAL ---
    // Como o script de seed salvou a senha "em texto puro" no banco, 
    // a comparação do bcrypt falharia. Se você for usar bcrypt no cadastro,
    // comente esse if abaixo e descomente o próximo!
    const isPasswordValid = user.password === pass;

    // --- FLUXO REAL DE PRODUÇÃO (COM BCRYPT) ---
    // const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }
}