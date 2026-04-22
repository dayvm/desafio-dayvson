import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    // Fazemos todas as contagens em paralelo para ser super rápido
    const [totalUsers, totalCategories, totalProducts, totalFavorites] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.category.count(),
      this.prisma.product.count(),
      this.prisma.favorite.count(),
    ]);

    return {
      users: totalUsers,
      categories: totalCategories,
      products: totalProducts,
      favorites: totalFavorites,
    };
  }
}