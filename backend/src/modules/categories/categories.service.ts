import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const categoryExists = await this.categoriesRepository.findByName(createCategoryDto.name);

    if (categoryExists) {
      throw new ConflictException('Já existe uma categoria com este nome.');
    }

    return this.categoriesRepository.create({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      ownerId: userId, // O ID vem do Controller, que pegou do Token JWT
    });
  }

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundException('Categoria não encontrada.');
    return category;
  }

  async remove(id: string, userId: string, userRole: string) {
    const category = await this.findOne(id);

    // Regra: Só pode deletar se for o dono da categoria OU se for um ADMIN
    if (category.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para deletar esta categoria.');
    }

    return this.categoriesRepository.delete(id);
  }
}