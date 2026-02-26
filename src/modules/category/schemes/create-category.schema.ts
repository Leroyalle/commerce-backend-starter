import z from 'zod';

export const createCategoryZodSchema = z.object({
  name: z.string().min(1).max(15),
  description: z.string().min(1).max(100),
});
