import { AuthCommands } from './modules/auth/auth.command';
import { accessAuthMiddleware } from './shared/infrastructure/middlewares/access-auth.middleware';
import { refreshGuard } from './shared/infrastructure/middlewares/refresh-auth.guard';

interface Deps {
  authCommands: AuthCommands;
}

export function createMiddlewares(deps: Deps) {
  const accessAuthGuard = accessAuthMiddleware(deps.authCommands.verifyToken);

  const refreshTokenGuard = refreshGuard(deps.authCommands);

  return {
    accessGuard: accessAuthGuard,
    refreshGuard: refreshTokenGuard,
  };
}
