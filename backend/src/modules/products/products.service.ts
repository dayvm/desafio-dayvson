import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsRepository } from './products.repository';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto, ownerId: string, file?: Express.Multer.File) {
    const categoryIds = [...new Set(createProductDto.categoryIds || [])];

    if (categoryIds.length > 0) {
      const existingCategories = await this.productsRepository.findCategoriesByIds(categoryIds);

      if (existingCategories.length !== categoryIds.length) {
        throw new NotFoundException('Uma ou mais categorias informadas não foram encontradas.');
      }
    }

    const imageUrl = file ? `/uploads/products/${file.filename}` : undefined;

    return this.productsRepository.create(
      {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        imageUrl,
        ownerId,
      },
      categoryIds,
    );
  }

  async findAll(query: ListProductsDto) {
    return this.productsRepository.findAll(query);
  }

  async findMine(ownerId: string, query: ListProductsDto) {
    return this.productsRepository.findAll(query, ownerId);
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
    userRole: string,
    file?: Express.Multer.File,
  ) {
    const product = await this.findOne(id);

    if (product.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para editar este produto.');
    }

    let categoryIds: string[] | undefined;

    if (updateProductDto.categoryIds !== undefined) {
      categoryIds = [...new Set(updateProductDto.categoryIds)];

      if (categoryIds.length > 0) {
        const existingCategories = await this.productsRepository.findCategoriesByIds(categoryIds);

        if (existingCategories.length !== categoryIds.length) {
          throw new NotFoundException('Uma ou mais categorias informadas não foram encontradas.');
        }
      }
    }

    const imageUrl = file ? `/uploads/products/${file.filename}` : undefined;

    const updatedProduct = await this.productsRepository.update(
      id,
      {
        ...(updateProductDto.name !== undefined ? { name: updateProductDto.name } : {}),
        ...(updateProductDto.description !== undefined
          ? { description: updateProductDto.description }
          : {}),
        ...(updateProductDto.price !== undefined ? { price: updateProductDto.price } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      },
      categoryIds,
    );

    if (file && product.imageUrl) {
      await this.deleteImageFile(product.imageUrl);
    }

    return updatedProduct;
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.findOne(id);

    if (product.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para deletar este produto.');
    }

    const deletedProduct = await this.productsRepository.delete(id);

    if (product.imageUrl) {
      await this.deleteImageFile(product.imageUrl);
    }

    return deletedProduct;
  }

  private async deleteImageFile(imageUrl: string) {
    if (!imageUrl.startsWith('/uploads/products/')) {
      return;
    }

    const filename = imageUrl.replace('/uploads/products/', '');
    await unlink(join(process.cwd(), 'uploads', 'products', filename)).catch(() => undefined);
  }
}
