import { Hono } from 'hono';

export interface CreateModuleResult<C = unknown> {
  commands: C;
  router: Hono;
}
