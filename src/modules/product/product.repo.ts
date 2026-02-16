import { count, desc, eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { Product, productSchema } from '@/shared/infrastructure/db/schema/product.schema';
import { productsToCategories } from '@/shared/infrastructure/db/schema/products-to-categories.schema';
import { IPaginationResult } from '@/shared/types/pagination-result.type';
import { IPagination } from '@/shared/types/pagination.type';

export interface IProductRepository {
  create(data: {
    name: string;
    price: number;
    aliases: string[];
    categories: string[];
  }): Promise<Product>;
  findAll(pagination?: IPagination): Promise<IPaginationResult<Product>>;
  findById(id: string): Promise<Product>;
}

export class ProductRepo implements IProductRepository {
  public async create(data: {
    name: string;
    price: number;
    aliases: string[];
    categories: string[];
  }): Promise<Product> {
    const [product] = await db.insert(productSchema).values(data).returning();

    for (const categoryId of data.categories) {
      await db.insert(productsToCategories).values({
        productId: product.id,
        categoryId: categoryId,
      });
    }

    return product;
  }

  public async findAll(pagination?: IPagination): Promise<IPaginationResult<Product>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 0;
    const items = await db.query.productSchema.findMany({
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(productSchema.createdAt)],
    });

    const [result] = await db.select({ count: count() }).from(productSchema);
    return {
      total: result.count,
      items,
    };
  }

  public async findById(id: string): Promise<Product> {
    return (await db.select().from(productSchema).where(eq(productSchema.id, id)))[0];
  }
}
