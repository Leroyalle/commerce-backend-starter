import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { ICategoryCommands } from './category.commands';
import { ICategoryQueries } from './category.queries';
import { createCategoryZodSchema } from './schemes/create-category.schema';

interface Deps {
  commands: ICategoryCommands;
  queries: ICategoryQueries;
}

export function createCategoryRouter(deps: Deps) {
  const router = new Hono();

  router.get('/', async c => {
    const result = await deps.queries.findAll();
    return c.json(result, 201);
  });

  router.post('/', zValidator('json', createCategoryZodSchema), async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.create(body);
    return c.json(result, 201);
  });

  return router;
}
