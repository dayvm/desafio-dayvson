import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Favorite, Prisma, Product } from '@prisma/client';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductUncheckedCreateInput, categoryIds: string[]): Promise<Product> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data });

      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          })),
        });
      }

      return product;
    });
  }

  async findAll(query: ListProductsDto, customOwnerId?: string) {
    // Desestruturamos usando o 'search' (exatamente como está no seu DTO)
    const { page = 1, limit = 10, search, categoryId } = query;
    const skip = (page - 1) * limit;

    // Montamos os filtros de forma dinâmica
    const where: Prisma.ProductWhereInput = {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categories: { some: { categoryId } } }),
      // Aplica o filtro de dono se ele foi passado pelo service ou pelo findMine
      ...(customOwnerId && { ownerId: customOwnerId }), 
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { category: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, email: true } },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProductUncheckedUpdateInput,
    categoryIds?: string[],
  ): Promise<Product> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data,
      });

      if (categoryIds) {
        await tx.productCategory.deleteMany({
          where: { productId: id },
        });

        if (categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }

      return product;
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findFavorite(userId: string, productId: string): Promise<Favorite | null> {
    return this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async createFavorite(userId: string, productId: string): Promise<Favorite> {
    return this.prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });
  }

  async deleteFavorite(userId: string, productId: string): Promise<Favorite> {
    return this.prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findCategoriesByIds(categoryIds: string[]) {
    return this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
      },
    });
  }
}
