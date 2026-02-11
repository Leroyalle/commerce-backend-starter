import { faker } from '@faker-js/faker/locale/ru';

import { createModules } from '@/modules';

import { db } from './client';
import { productSchema } from './schema/product.schema';

const { product, meilisearch } = await createModules();

async function clear() {
  console.log('Clearing...');
  await db.delete(productSchema);
  await meilisearch.indexes.productIndex.deleteAllDocuments().waitTask();
}

async function seed() {
  console.log('Seeding data...');

  for (let i = 0; i < 10; i++) {
    const name = faker.commerce.productName();
    const aliases = [name, name.toLowerCase(), name.replace(/\s+/g, '')];
    await product.commands.create({
      name,
      price: faker.number.int({ min: 1, max: 100_000 }),
      aliases,
    });
  }
}

async function main() {
  try {
    await clear();
    await seed();
    console.log('Done!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
