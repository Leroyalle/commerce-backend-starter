import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { paramsZodSchema } from '@/shared/infrastructure/zod/params.schema';

import { ProductCommands } from './product.commands';
import { IProductQueries } from './product.queries';
import { createProductZodSchema } from './schemas/create-product.schema';
import { searchProductZodSchema } from './schemas/search.schema';

interface Deps {
  commands: ProductCommands;
  queries: IProductQueries;
}

export function createProductRouter(deps: Deps): Hono {
  const productRouter = new Hono();

  productRouter.get('/', zValidator('query', searchProductZodSchema), async c => {
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

  productRouter.get('/:id', zValidator('param', paramsZodSchema), c => {
    const id = c.req.valid('param');
    const data = deps.queries.findById(id);
    return c.json(data);
  });

  return productRouter;
}
