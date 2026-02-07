import { Hono, MiddlewareHandler } from 'hono';
import { setCookie } from 'hono/cookie';

import { User } from '@/shared/infrastructure/db/schema/user.schema';
import { RefreshAuthVars } from '@/shared/types/auth-variables.type';

import { AuthCommands } from './auth.command';

interface Deps {
  commands: AuthCommands;
  refreshGuard: MiddlewareHandler<{
    Variables: RefreshAuthVars;
  }>;
}
export function createAuthRouter(deps: Deps): Hono {
  const authRouter = new Hono();

  authRouter.post('/register', async c => {
    const body = await c.req.json<Omit<User, 'id'>>();
    const result = await deps.commands.register(body);
    if (result.status === 'error') return c.json(result, 400);
    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return c.json({ message: 'Регистрация прошла успешно!', accessToken: result.accessToken }, 201);
  });

  authRouter.post('/login', async c => {
    const body = await c.req.json<Pick<User, 'email' | 'password'>>();
    const result = await deps.commands.login(body);
    if (result.status === 'error') return c.json(result, 400);
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
