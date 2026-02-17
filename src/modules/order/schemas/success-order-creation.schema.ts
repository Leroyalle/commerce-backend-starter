import { z } from '@hono/zod-openapi';

export const successOrderCreation = z.object({
  success: z.boolean(),
  message: z.string(),
});
