import { zValidator } from '@hono/zod-validator';
import { Hono, MiddlewareHandler } from 'hono';
import { setCookie } from 'hono/cookie';

import { AuthVars, RefreshAuthVars } from '@/shared/types/auth-variables.type';

import { AuthCommands } from './auth.commands';
import { loginZodSchema } from './schemas/login.schema';
import { registerZodSchema } from './schemas/register.schema';
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

  authRouter.post(
    '/reset-password',
    deps.accessGuard,
    zValidator('json', loginZodSchema),
    async c => {
      const body = c.req.valid('json');
      const userId = c.get('userId');
      await deps.commands.resetPassword(userId, body.password);
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
      const userId = c.get('userId');
      await deps.commands.verifyPasswordCode(userId, body.code, body.newPassword);
      return c.json(
        {
          message: 'Пароль успешно изменен!',
        },
        201,
      );
    },
  );

  authRouter.post('/refresh', deps.refreshGuard, async c => {
    const userId = c.get('userId');
    const jti = c.get('jti');
    const result = await deps.commands.refresh(userId, jti);
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
