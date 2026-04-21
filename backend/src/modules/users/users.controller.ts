import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, UseInterceptors, UploadedFile, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { type AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface'; // Importe a interface

@UseGuards(JwtAuthGuard, RolesGuard) // O JwtAuthGuard barra não-logados; o RolesGuard avalia o @Roles
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ---- ROTAS EXCLUSIVAS DO ADMIN ----

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ---- ROTAS PARA O USUÁRIO COMUM (Seu próprio perfil) ----
  // Note que não tem o @Roles() aqui, então qualquer um com JWT passa!

  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req: AuthenticatedRequest, file, cb) => { // Tipamos o req aqui!
          // Agora o autocomplete funciona e o erro some sem precisar de 'as any'
          const userId = req.user.userId;

          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Trava de segurança: só aceita imagens
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Somente arquivos de imagem são permitidos!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(@Request() req: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    // req.user.userId vem do token JWT (o usuário só atualiza o próprio avatar)
    return this.usersService.updateAvatar(req.user.userId, file);
  }
}
