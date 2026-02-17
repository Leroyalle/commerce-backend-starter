import { z } from '@hono/zod-openapi';

export const accessTokenResponseSchema = z.object({
  accessToken: z.object({
    expAt: z.date(),
    token: z.string(),
  }),
});
