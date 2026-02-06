import { db } from './client';
import { productSchema } from './schema/product.schema';

async function seed() {
  for (let i = 0; i < 10; i++) {
    await db.insert(productSchema).values({
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 100),
    });
  }
}

seed().then(() => console.log('seed is done'));
