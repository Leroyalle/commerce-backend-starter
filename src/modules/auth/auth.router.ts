import { zValidator } from '@hono/zod-validator';
import { Hono, MiddlewareHandler } from 'hono';
import { setCookie } from 'hono/cookie';

import { RefreshAuthVars } from '@/shared/types/auth-variables.type';

import { AuthCommands } from './auth.command';
import { loginZodSchema } from './schemas/login.schema';
import { registerZodSchema } from './schemas/register.schema';
import { verifyCodeZodSchema } from './schemas/verify-code.schema';

interface Deps {
  commands: AuthCommands;
  refreshGuard: MiddlewareHandler<{
    Variables: RefreshAuthVars;
  }>;
}
export function createAuthRouter(deps: Deps): Hono {
  const authRouter = new Hono();

  authRouter.post('/register', zValidator('json', registerZodSchema), async c => {
    const body = c.req.valid('json');
    await deps.commands.register(body);
    return c.json({ message: 'Код отправлен на ваш email! Не забудьте проверить папку спам' }, 201);
  });

  authRouter.post('/verify-email', zValidator('json', verifyCodeZodSchema), async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.verifyCode(body.email, body.code);
    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return c.json(
      { message: 'Регистрация прошла успешно! Добро пожаловать!', accessToken: result.accessToken },
      201,
    );
  });

  authRouter.post('/login', zValidator('json', loginZodSchema), async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.login(body);
    return c.json({ message: 'Авторизация прошла успешно!', accessToken: result.accessToken }, 201);
  });

  authRouter.post('/refresh', deps.refreshGuard, async c => {
    const userId = c.get('userId');
    const jti = c.get('jti');
    const result = await deps.commands.refresh(userId, jti);
    return c.json({ message: 'Токен обновлен!', accessToken: result.accessToken }, 201);
  });

  return authRouter;
}
