import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { Product, productSchema } from '@/shared/infrastructure/db/schema/product.schema';

export interface IProductRepository {
  create(data: { name: string; price: number }): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product>;
}

export class ProductRepo implements IProductRepository {
  public async create(data: { name: string; price: number }): Promise<Product> {
    return (await db.insert(productSchema).values(data).returning())[0];
  }

  public async findAll(): Promise<Product[]> {
    return await db.select().from(productSchema);
  }

  public async findById(id: string): Promise<Product> {
    return (await db.select().from(productSchema).where(eq(productSchema.id, id)))[0];
  }
}
