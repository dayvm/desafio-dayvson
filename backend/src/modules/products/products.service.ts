import {
  BadRequestException,
  ConflictException,
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
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    private readonly notificationsService: NotificationsService // 
  ) { }

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
    // Pegamos o ownerId que veio da URL (se existir) e passamos para o repositório
    return this.productsRepository.findAll(query, query.ownerId);
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

  async favorite(id: string, userId: string) {
    const product = await this.findOne(id);

    if (product.ownerId === userId) {
      throw new BadRequestException('Você não pode favoritar o seu próprio produto.');
    }

    const existingFavorite = await this.productsRepository.findFavorite(userId, id);
    if (existingFavorite) {
      throw new ConflictException('Este produto já está nos seus favoritos.');
    }

    // 4. Salva o favorito no banco
    const newFavorite = await this.productsRepository.createFavorite(userId, id);

    // 5. DISPARA A NOTIFICAÇÃO (Mágica acontecendo aqui)
    // Usamos um try/catch silencioso para garantir que, se a notificação falhar por algum motivo, 
    // não cancele o favorito que acabou de ser salvo com sucesso.
    try {
      await this.notificationsService.create({
        recipientId: product.ownerId,
        actorId: userId,
        type: 'FAVORITE_ADDED',
        entityType: 'Product',
        entityId: product.id,
        title: 'Novo Favorito!',
        message: `Alguém acabou de favoritar o seu produto: ${product.name}`,
      });
    } catch (error) {
      console.error('Falha ao enviar notificação de favorito:', error);
    }

    return newFavorite;
  }

  async unfavorite(id: string, userId: string) {
    await this.findOne(id);

    const existingFavorite = await this.productsRepository.findFavorite(userId, id);

    if (!existingFavorite) {
      throw new NotFoundException('Este produto não está nos seus favoritos.');
    }

    // Apenas retornamos a deleção (não precisa de notificação para desfavoritar)
    return await this.productsRepository.deleteFavorite(userId, id);
  }

  private async deleteImageFile(imageUrl: string) {
    if (!imageUrl.startsWith('/uploads/products/')) {
      return;
    }

    const filename = imageUrl.replace('/uploads/products/', '');
    await unlink(join(process.cwd(), 'uploads', 'products', filename)).catch(() => undefined);
  }
}
