import { Meilisearch } from 'meilisearch';

import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export function createMeilisearchClient() {
  return new Meilisearch({
    host: getEnv('MEILI_HOST'),
    apiKey: getEnv('MEILI_MASTER_KEY'),
  });
}
