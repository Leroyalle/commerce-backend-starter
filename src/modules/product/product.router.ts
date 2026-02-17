import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { Index } from 'meilisearch';

import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { paramsZodSchema } from '@/shared/infrastructure/zod/params.schema';

import { ProductCommands } from './product.commands';
import { IProductQueries } from './product.queries';
import { createProductZodSchema } from './schemas/create-product.schema';
import { findProductsZodSchema } from './schemas/find-products.schema';

interface Deps {
  commands: ProductCommands;
  queries: IProductQueries;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
}

export function createProductRouter(deps: Deps): Hono {
  const productRouter = new Hono();

  productRouter.get('/', zValidator('query', findProductsZodSchema), async c => {
    const query = c.req.valid('query');
    const data = await deps.queries.findAll(query);
    return c.json(data);
  });

  // TODO: гвард на авторизацию админа
  productRouter.post('/', zValidator('json', createProductZodSchema), async c => {
    const body = c.req.valid('json');
    const data = await deps.commands.create(body);
    return c.json(data, 201);
  });

  productRouter.get('/:id', zValidator('param', paramsZodSchema), async c => {
    const params = c.req.valid('param');
    const data = await deps.queries.findById(params.id);
    return c.json(data);
  });

  return productRouter;
}
