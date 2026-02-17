import { $, createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { MiddlewareHandler } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

import { AuthVars, RefreshAuthVars } from '@/shared/types/auth-variables.type';
import { AccountResultActions } from '@/shared/types/auth/link-or-create-account.type';

import { AuthCommands } from './auth.commands';
import { loginZodSchema } from './schemas/login.schema';
import { oauthCallbackZodSchema } from './schemas/oauth-callback.schema';
import { oauthProviderZodSchema } from './schemas/oauth-provider.schema';
import { registerZodSchema } from './schemas/register.schema';
import { resetPasswordZodSchema } from './schemas/reset-password.schema';
import {
  verifyEmailCodeZodSchema,
  verifyPasswordCodeZodSchema,
} from './schemas/verify-code.schema';

const SendCodeResponseSchema = z.object({
  message: z.string(),
});

const AccessTokenResponseSchema = z.object({
  accessToken: z.object({
    expAt: z.date(),
    token: z.string(),
  }),
});

const LoginByProviderResponseSchema = z.union([SendCodeResponseSchema, AccessTokenResponseSchema]);

interface Deps {
  commands: AuthCommands;
  refreshGuard: MiddlewareHandler<{
    Variables: RefreshAuthVars;
  }>;
  accessGuard: MiddlewareHandler<{ Variables: AuthVars }>;
  optionalAccessGuard: MiddlewareHandler<{ Variables: Partial<AuthVars> }>;
}
export function createAuthRouter(
  deps: Deps,
): OpenAPIHono<{ Variables: AuthVars & Partial<RefreshAuthVars> }> {
  const authRouter = new OpenAPIHono<{ Variables: AuthVars & Partial<RefreshAuthVars> }>();

  const registerRoute = createRoute({
    path: '/register',
    method: 'post',
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

  authRouter.openapi(registerRoute, async c => {
    const body = c.req.valid('json');
    await deps.commands.register(body);
    return c.json({ message: 'Код отправлен на ваш email! Не забудьте проверить папку спам' }, 201);
  });

  const verifyEmailRoute = createRoute({
    path: '/verify-email',
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
            schema: z.object({
              message: z.string(),
              accessToken: z.object({
                token: z.string(),
                expAt: z.date(),
              }),
            }),
          },
        },
      },
    },
  });

  authRouter.openapi(verifyEmailRoute, async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.verifyEmailCode(body.email, body.code);
    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });
    return c.json(
      { message: 'Регистрация прошла успешно! Добро пожаловать!', accessToken: result.accessToken },
      201,
    );
  });

  const loginRoute = createRoute({
    path: '/login',
    method: 'post',
    summary: 'Авторизация',
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
            schema: z.object({
              message: z.string(),
              accessToken: z.object({
                token: z.string(),
                expAt: z.date(),
              }),
            }),
          },
        },
      },
    },
  });

  authRouter.openapi(loginRoute, async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.login(body);
    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });
    return c.json({ message: 'Авторизация прошла успешно!', accessToken: result.accessToken }, 201);
  });

  const loginByProviderRoute = createRoute({
    path: '/login/:provider',
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

  // $(authRouter).use(loginByProviderRoute.path, deps.optionalAccessGuard);

  authRouter.openapi(loginByProviderRoute, c => {
    const params = c.req.valid('param');
    const result = deps.commands.oauthLogin(params.provider);
    setCookie(c, 'oauth_state', result.state, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10,
      sameSite: 'Lax',
    });
    return c.redirect(result.url);
  });

  const loginByProviderCallbackSchema = createRoute({
    path: '/login/:provider/callback',
    method: 'get',
    summary: 'Авторизация через провайдер',
    description: 'Авторизация через провайдер',
    request: {
      params: oauthProviderZodSchema,
      query: oauthCallbackZodSchema,
    },
    responses: {
      200: {
        description: 'Успешная авторизация',
        content: {
          'application/json': {
            schema: LoginByProviderResponseSchema,
          },
        },
      },
    },
  });

  authRouter.openapi(loginByProviderCallbackSchema, async c => {
    const params = c.req.valid('param');
    const queryParams = c.req.valid('query');
    const storedState = getCookie(c, 'oauth_state') ?? '';
    const result = await deps.commands.oauthLoginCallback(params.provider, {
      ...queryParams,
      storedState,
    });

    if (result?.action === AccountResultActions.SEND_CODE) {
      return c.json({ message: result.message }, 200);
    }

    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });

    return c.json({ accessToken: result.accessToken }, 200);
  });

  const resetPasswordRoute = createRoute({
    path: '/reset-password',
    method: 'post',
    summary: 'Сброс пароля',
    description: 'Сброс пароля',
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

  $(authRouter).use(resetPasswordRoute.path, deps.accessGuard);

  authRouter.openapi(resetPasswordRoute, async c => {
    const body = c.req.valid('json');
    const user = c.get('user');
    const accountId = c.get('accountId');
    await deps.commands.resetPassword(user, accountId, body.password);
    return c.json(
      {
        message: 'Письмо с кодом подтверждения отправлено на ваш email',
      },
      201,
    );
  });

  const verifyPasswordCodeRoute = createRoute({
    path: '/verify-password',
    method: 'post',
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

  $(authRouter).use(verifyPasswordCodeRoute.path, deps.accessGuard);

  authRouter.openapi(verifyPasswordCodeRoute, async c => {
    const body = c.req.valid('json');
    const user = c.get('user');
    const accountId = c.get('accountId');

    await deps.commands.verifyPasswordCode(user, accountId, body.code, body.newPassword);
    return c.json(
      {
        message: 'Пароль успешно изменен!',
      },
      201,
    );
  });

  const refreshRoute = createRoute({
    path: '/refresh',
    method: 'post',
    summary: 'Обновление токена',
    description: 'Обновление токена',
    responses: {
      201: {
        description: 'Токен обновлен!',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
              accessToken: z.object({
                expAt: z.date(),
                token: z.string(),
              }),
            }),
          },
        },
      },
    },
  });

  $(authRouter).use(refreshRoute.path, deps.refreshGuard);

  authRouter.openapi(refreshRoute, async c => {
    const accountId = c.get('accountId');
    const jti = c.get('jti');
    if (!jti) throw new Error('jti not found');
    const result = await deps.commands.refresh(accountId, jti);
    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });
    return c.json({ message: 'Токен обновлен!', accessToken: result.accessToken }, 201);
  });

  return authRouter;
}
