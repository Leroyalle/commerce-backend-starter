import z from 'zod';

export const verifyCodeZodSchema = z.object({
  code: z.coerce.number().min(4).max(4),
  // type: z.enum(['verify_email', 'reset_password']),
  email: z.email(),
});
