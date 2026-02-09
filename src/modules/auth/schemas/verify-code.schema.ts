import z from 'zod';

export const verifyEmailCodeZodSchema = z.object({
  code: z.coerce.number().min(1000).max(9999),
  email: z.email(),
});

export const verifyPasswordCodeZodSchema = z.object({
  newPassword: z.string().min(6).max(20),
  code: z.coerce.number().min(1000).max(9999),
});
