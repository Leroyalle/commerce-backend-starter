import { Hono } from 'hono';

import { ProductCommands } from './product.commands';
import { ProductQueries } from './product.queries';

interface Deps {
  commands: ProductCommands;
  queries: ProductQueries;
}

export function createProductRouter(deps: Deps): Hono {
  const productRouter = new Hono();

  productRouter.get('/', async c => {
    const data = await deps.queries.findAll();
    return c.json(data);
  });

  // TODO: гвард на авторизацию админа
  productRouter.post('/', async c => {
    const body = await c.req.json<{ name: string; price: number }>();
    const data = await deps.commands.create(body);
    return c.json(data, 201);
  });

  productRouter.get('/:id', c => {
    const id = c.req.param('id');
    const data = deps.queries.findById(id);
    return c.json(data);
  });

  return productRouter;
}
