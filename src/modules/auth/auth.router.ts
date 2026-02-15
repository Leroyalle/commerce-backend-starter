import { zValidator } from '@hono/zod-validator';
import { Hono, MiddlewareHandler } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

import { AuthVars, RefreshAuthVars } from '@/shared/types/auth-variables.type';

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

interface Deps {
  commands: AuthCommands;
  refreshGuard: MiddlewareHandler<{
    Variables: RefreshAuthVars;
  }>;
  accessGuard: MiddlewareHandler<{ Variables: AuthVars }>;
}
export function createAuthRouter(deps: Deps): Hono {
  const authRouter = new Hono();

  authRouter.post('/register', zValidator('json', registerZodSchema), async c => {
    const body = c.req.valid('json');
    await deps.commands.register(body);
    return c.json({ message: 'Код отправлен на ваш email! Не забудьте проверить папку спам' }, 201);
  });

  authRouter.post('/verify-email', zValidator('json', verifyEmailCodeZodSchema), async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.verifyEmailCode(body.email, body.code);
    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });
    return c.json(
      { message: 'Регистрация прошла успешно! Добро пожаловать!', accessToken: result.accessToken },
      201,
    );
  });

  authRouter.post('/login', zValidator('json', loginZodSchema), async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.login(body);
    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });
    return c.json({ message: 'Авторизация прошла успешно!', accessToken: result.accessToken }, 201);
  });

  authRouter.get('/login/:provider', zValidator('param', oauthProviderZodSchema), c => {
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

  authRouter.get(
    '/login/:provider/callback',
    zValidator('param', oauthProviderZodSchema),
    zValidator('query', oauthCallbackZodSchema),
    async c => {
      const params = c.req.valid('param');
      const queryParams = c.req.valid('query');
      const storedState = getCookie(c, 'oauth_state') ?? '';
      const result = await deps.commands.oauthLoginCallback(params.provider, {
        ...queryParams,
        storedState,
      });

      setCookie(c, 'refreshToken', result.refreshToken.token, {
        httpOnly: true,
        // secure: true,
        sameSite: 'strict',
        path: '/',
        expires: result.refreshToken.expAt,
      });

      return c.json({ accessToken: result.accessToken }, 201);
    },
  );

  authRouter.post(
    '/reset-password',
    deps.accessGuard,
    zValidator('json', resetPasswordZodSchema),
    async c => {
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
    },
  );

  authRouter.post(
    '/verify-password',
    deps.accessGuard,
    zValidator('json', verifyPasswordCodeZodSchema),
    async c => {
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
    },
  );

  authRouter.post('/refresh', deps.refreshGuard, async c => {
    const accountId = c.get('accountId');
    const jti = c.get('jti');
    const result = await deps.commands.refresh(accountId, jti);
    setCookie(c, 'refreshToken', result.refreshToken.token, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/',
      expires: result.refreshToken.expAt,
    });
    return c.json({ message: 'Токен обновлен!', accessToken: result.accessToken }, 201);
  });

  return authRouter;
}
