import { Meilisearch } from 'meilisearch';

import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export const meilisearchClient = new Meilisearch({
  host: getEnv('MEILI_HOST'),
  apiKey: getEnv('MEILI_MASTER_KEY'),
});
