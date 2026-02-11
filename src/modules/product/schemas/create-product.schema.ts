import z from 'zod';

export const createProductZodSchema = z.object({
  name: z.string().max(30).min(1),
  price: z.number().max(1000000).min(1),
  aliases: z.array(z.string().min(1).max(10)).default([]),
});
