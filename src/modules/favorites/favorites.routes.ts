import { createRoute } from '@hono/zod-openapi';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';
import { favoritesSelectSchema } from '@/shared/infrastructure/db/schema/favorite.schema';

export const addFavoriteRoute = createRoute({
  summary: 'Добавить товар в избранное',
  tags: ['Favorites'],
  description: 'Добавляет товар в избранное',
  method: 'post',
  path: '/favorites',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  responses: {
    201: {
      description: 'Товар сохранен',
      content: {
        'application/json': {
          schema: favoritesSelectSchema,
        },
      },
    },
  },
});
