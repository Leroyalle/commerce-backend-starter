import { and, count, desc, eq, exists, inArray, SQL } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { Product, productSchema } from '@/shared/infrastructure/db/schemes/product.schema';
import { productsToCategoriesSchema } from '@/shared/infrastructure/db/schemes/products-to-categories.schema';
import { IPaginationResult } from '@/shared/types/pagination-result.type';

import { FindProductsQuery } from './schemas/find-products.schema';

export interface IProductRepository {
  create(data: {
    name: string;
    price: number;
    aliases: string[];
    details: Record<string, unknown>;
    description: string;
    image: string;
    categories: string[];
  }): Promise<Product>;
  findAll(
    query?: FindProductsQuery,
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price' | 'image' | 'details'>>>;
  findById(id: string): Promise<Product>;
  findByIds(ids: string[]): Promise<Product[]>;
}

export class ProductRepo implements IProductRepository {
  public async create(data: {
    name: string;
    price: number;
    image: string;
    details: Record<string, unknown>;
    aliases: string[];
    description: string;
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
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price' | 'image' | 'details'>>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const categoryId = query?.categoryId;

    // const isFavoriteExpr = userId
    //   ? sql<boolean>`
    //   EXISTS (
    //     SELECT 1
    //     FROM ${favoriteSchema}
    //     WHERE ${favoriteSchema.productId} = ${productSchema.id}
    //     AND ${favoriteSchema.userId} = ${userId}
    //   )
    // `
    //   : sql<boolean>`false`;

    const items = await db.query.productSchema.findMany({
      limit,
      columns: {
        id: true,
        image: true,
        details: true,
        name: true,
        price: true,
        description: true,
      },
      offset: (page - 1) * limit,
      orderBy: [desc(productSchema.createdAt)],

      // extras: {
      //   isFavorite: isFavoriteExpr.as('isFavorite'),
      // },

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

  public findByIds(ids: string[]) {
    return db.query.productSchema.findMany({
      where: inArray(productSchema.id, ids),
      orderBy: [desc(productSchema.createdAt)],
    });
  }
}
