import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
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

  async findAll(query: ListProductsDto, ownerId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(ownerId ? { ownerId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.categoryId
        ? {
            categories: {
              some: {
                categoryId: query.categoryId,
              },
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { name: true, email: true } },
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
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
