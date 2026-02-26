import { faker } from '@faker-js/faker/locale/ru';

import { createModules } from '@/modules';

import { db } from './client';
import { Category, categorySchema } from './schemes/category.schema';
import { productSchema } from './schemes/product.schema';
import { productsToCategoriesSchema } from './schemes/products-to-categories.schema';

const { product, meilisearch, category } = await createModules();

async function clear() {
  console.log('Clearing...');
  await db.delete(productsToCategoriesSchema);
  await db.delete(productSchema);
  await db.delete(categorySchema);
  await meilisearch.indexes.productIndex.deleteAllDocuments().waitTask();
}

async function seed() {
  console.log('Seeding data...');
  const categories: Category[] = [];

  for (let i = 0; i < 10; i++) {
    const name = faker.commerce.department();
    const description = faker.commerce.productDescription();
    const createdCategory = await category.commands.create({ name, description });
    categories.push(createdCategory);
  }

  for (let i = 0; i < 100; i++) {
    const name = faker.commerce.productName();
    const aliases = [name, name.toLowerCase(), name.replace(/\s+/g, '')];
    const description = faker.commerce.productDescription();

    const randomIds = new Set([
      categories[Math.floor(Math.random() * 10)].id,
      categories[Math.floor(Math.random() * 10)].id,
    ]);

    await product.commands.create({
      description,
      name,
      image: faker.image.urlPicsumPhotos(),
      details: {},
      price: faker.number.int({ min: 1, max: 100_000 }),
      aliases,
      categories: Array.from(randomIds),
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
