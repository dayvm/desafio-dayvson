import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
      ownerId: userId,
    });
  }

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return category;
  }

  async remove(id: string, userId: string, userRole: string) {
    const category = await this.findOne(id);

    if (category.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para deletar esta categoria.');
    }

    return this.categoriesRepository.delete(id);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string, userRole: string) {
    const category = await this.findOne(id);

    if (category.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para editar esta categoria.');
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const categoryWithSameName = await this.categoriesRepository.findByName(updateCategoryDto.name);

      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new ConflictException('Já existe uma categoria com este nome.');
      }
    }

    return this.categoriesRepository.update(id, updateCategoryDto);
  }
}
