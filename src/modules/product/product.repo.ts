import { and, count, desc, eq, exists, SQL } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { Product, productSchema } from '@/shared/infrastructure/db/schema/product.schema';
import { productsToCategoriesSchema } from '@/shared/infrastructure/db/schema/products-to-categories.schema';
import { IPaginationResult } from '@/shared/types/pagination-result.type';

import { FindProductsQuery } from './schemas/find-products.schema';

export interface IProductRepository {
  create(data: {
    name: string;
    price: number;
    aliases: string[];
    categories: string[];
  }): Promise<Product>;
  findAll(
    query?: FindProductsQuery,
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price'>>>;
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
      await db.insert(productsToCategoriesSchema).values({
        productId: product.id,
        categoryId: categoryId,
      });
    }

    return product;
  }

  public async findAll(
    query?: FindProductsQuery,
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price'>>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const categoryId = query?.categoryId;
    const items = await db.query.productSchema.findMany({
      limit,
      columns: {
        id: true,
        name: true,
        price: true,
      },
      offset: (page - 1) * limit,
      orderBy: [desc(productSchema.createdAt)],
      where: (product, { exists }) => {
        const conditions: SQL[] = [];

        if (!categoryId) return undefined;

        conditions.push(
          exists(
            db
              .select()
              .from(productsToCategoriesSchema)
              .where(
                and(
                  eq(productsToCategoriesSchema.productId, product.id),
                  eq(productsToCategoriesSchema.categoryId, categoryId),
                ),
              ),
          ),
        );

        return and(...conditions);
      },
    });

    const [result] = await db
      .select({ count: count() })
      .from(productSchema)
      .where(
        categoryId
          ? exists(
              db
                .select()
                .from(productsToCategoriesSchema)
                .where(
                  and(
                    eq(productsToCategoriesSchema.productId, productSchema.id),
                    eq(productsToCategoriesSchema.categoryId, categoryId),
                  ),
                ),
            )
          : undefined,
      );
    return {
      total: result.count,
      items,
    };
  }

  public async findById(id: string): Promise<Product> {
    return (await db.select().from(productSchema).where(eq(productSchema.id, id)))[0];
  }
}
