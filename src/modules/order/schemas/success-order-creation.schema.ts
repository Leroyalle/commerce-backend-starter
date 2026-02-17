import { z } from '@hono/zod-openapi';

export const successOrderCreation = z.object({
  message: z.string,
  success: z.boolean(),
});
