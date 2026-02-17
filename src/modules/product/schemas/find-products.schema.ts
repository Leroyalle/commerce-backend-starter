import z from 'zod';

import { paginationZodSchema } from '@/shared/infrastructure/zod/pagination.schema';

export const findProductsZodSchema = paginationZodSchema.extend({
  categoryId: z.uuid().optional(),
});

export type FindProductsQuery = z.infer<typeof findProductsZodSchema>;
