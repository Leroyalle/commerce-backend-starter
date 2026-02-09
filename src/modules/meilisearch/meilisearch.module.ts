import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { createMeilisearchClient } from '@/shared/infrastructure/meilisearch/client-factory';

export function createMeilisearchModule() {
  const client = createMeilisearchClient();
  const productIndex = client.index<Pick<Product, 'id' | 'name' | 'price'>>('products');

  return {
    client,
    indexes: {
      productIndex,
    },
  };
}
