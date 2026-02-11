import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { createMeilisearchClient } from '@/shared/infrastructure/meilisearch/client-factory';

export async function createMeilisearchModule() {
  const client = createMeilisearchClient();
  const productIndex = client.index<Pick<Product, 'id' | 'name' | 'price'>>('products');

  await productIndex.updateSearchableAttributes(['name', 'aliases']).waitTask();

  return {
    client,
    indexes: {
      productIndex,
    },
  };
}
