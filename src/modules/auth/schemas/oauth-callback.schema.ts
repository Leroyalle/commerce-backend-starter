import z from 'zod';

export const oauthCallbackZodSchema = z.object({
  state: z.uuid(),
  code: z.string(),
});
