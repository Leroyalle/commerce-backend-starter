import { $, OpenAPIHono } from '@hono/zod-openapi';
import { MiddlewareHandler } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

import { getEnv } from '@/shared/lib/helpers/get-env.helper';
import { AuthVars, RefreshAuthVars } from '@/shared/types/auth-variables.type';
import { AccountResultActions } from '@/shared/types/auth/link-or-create-account.type';

import { AuthCommands } from './auth.commands';
import {
  loginByProviderCallbackSchema,
  loginByProviderRoute,
  loginRoute,
  refreshRoute,
  registerRoute,
  resetPasswordRoute,
  verifyEmailRoute,
  verifyPasswordCodeRoute,
} from './auth.routes';

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

  authRouter.openapi(registerRoute, async c => {
    const body = c.req.valid('json');
    await deps.commands.register(body);
    return c.json({ message: 'Код отправлен на ваш email! Не забудьте проверить папку спам' }, 201);
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

    return c.redirect(getEnv('FRONTEND_URL'));
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
