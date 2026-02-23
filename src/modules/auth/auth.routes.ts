import { createRoute, z } from '@hono/zod-openapi';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';

import { accessTokenResponseSchema } from './schemas/access-token-response.schema';
import { loginZodSchema } from './schemas/login.schema';
import { oauthCallbackZodSchema } from './schemas/oauth-callback.schema';
import { oauthProviderZodSchema } from './schemas/oauth-provider.schema';
import { registerZodSchema } from './schemas/register.schema';
import { resetPasswordZodSchema } from './schemas/reset-password.schema';
import {
  verifyEmailCodeZodSchema,
  verifyPasswordCodeZodSchema,
} from './schemas/verify-code.schema';

export const registerRoute = createRoute({
  path: '/register',
  method: 'post',
  tags: ['Auth'],
  summary: 'Регистрация',
  description: 'Регистрация',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerZodSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Код отправлен на ваш email! Не забудьте проверить папку спам',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const verifyEmailRoute = createRoute({
  path: '/verify-email',
  tags: ['Auth'],
  method: 'post',
  summary: 'Подтверждение email',
  description: 'Подтверждение email',
  request: {
    body: {
      content: {
        'application/json': {
          schema: verifyEmailCodeZodSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Регистрация прошла успешно! Добро пожаловать!',
      content: {
        'application/json': {
          schema: accessTokenResponseSchema.extend({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const loginRoute = createRoute({
  path: '/login',
  method: 'post',
  summary: 'Авторизация',
  tags: ['Auth'],
  description: 'Авторизация',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginZodSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Авторизация прошла успешно!',
      content: {
        'application/json': {
          schema: accessTokenResponseSchema.extend({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const loginByProviderRoute = createRoute({
  path: '/login/:provider',
  tags: ['Auth'],
  method: 'get',
  summary: 'Авторизация через провайдер',
  description: 'Авторизация через провайдер',
  request: {
    params: oauthProviderZodSchema,
  },
  responses: {
    302: {
      description: 'Redirect to OAuth provider',
      headers: {
        Location: {
          schema: {
            type: 'string',
          },
          description: 'URL провайдера для авторизации',
        },
      },
    },
  },
});

export const loginByProviderCallbackSchema = createRoute({
  path: '/login/:provider/callback',
  method: 'get',
  tags: ['Auth'],
  summary: 'Авторизация через провайдер',
  description: 'Авторизация через провайдер',
  request: {
    params: oauthProviderZodSchema,
    query: oauthCallbackZodSchema,
  },
  responses: {
    302: {
      description: 'Redirect to OAuth provider',
      headers: {
        Location: {
          schema: {
            type: 'string',
          },
          description: 'URL провайдера для авторизации',
        },
      },
    },
  },
});

export const resetPasswordRoute = createRoute({
  path: '/reset-password',
  tags: ['Auth'],
  method: 'post',
  summary: 'Сброс пароля',
  description: 'Сброс пароля',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordZodSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Письмо с кодом подтверждения отправлено на ваш email',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const verifyPasswordCodeRoute = createRoute({
  path: '/verify-password',
  method: 'post',
  tags: ['Auth'],
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  summary: 'Подтверждение сброса пароля',
  description: 'Подтверждение сброса пароля',
  request: {
    body: {
      content: {
        'application/json': {
          schema: verifyPasswordCodeZodSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Пароль успешно изменен!',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const refreshRoute = createRoute({
  path: '/refresh',
  method: 'post',
  tags: ['Auth'],
  summary: 'Обновление токена',
  security: [{ [SECURITY_SCHEMES.REFRESH_TOKEN_COOKIE]: [] }],
  description: 'Обновление токена',
  responses: {
    201: {
      description: 'Токен обновлен!',
      content: {
        'application/json': {
          schema: accessTokenResponseSchema.extend({ message: z.string() }),
        },
      },
    },
  },
});
