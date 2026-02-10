import { AuthCommands } from './modules/auth/auth.commands';
import { accessAuthGuard } from './shared/infrastructure/middlewares/access-auth.guard';
import { refreshGuard } from './shared/infrastructure/middlewares/refresh-auth.guard';

interface Deps {
  authCommands: AuthCommands;
}

export function createMiddlewares(deps: Deps) {
  const accessTokenGuard = accessAuthGuard(deps.authCommands);
  const refreshTokenGuard = refreshGuard(deps.authCommands);

  return {
    accessGuard: accessTokenGuard,
    refreshGuard: refreshTokenGuard,
  };
}
