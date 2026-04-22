import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // Injetamos o Repository em vez do Prisma diretamente
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.usersRepository.findByEmail(createUserDto.email);

    if (userExists) {
      throw new ConflictException('Este email já está em uso.');
    }
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword, 
      role: createUserDto.role || 'USER',
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async remove(id: string) {
    await this.findOne(id); // Usa o método acima para garantir que existe
    return this.usersRepository.delete(id);
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    // Monta a URL pública que o front-end vai usar
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersRepository.updateAvatar(id, avatarUrl);
  }
}