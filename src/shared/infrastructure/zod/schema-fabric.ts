import { z } from '@hono/zod-openapi';
import { createSchemaFactory } from 'drizzle-zod';

export const { createSelectSchema } = createSchemaFactory({ zodInstance: z });
