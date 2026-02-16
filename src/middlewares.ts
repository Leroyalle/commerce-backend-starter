import { AuthCommands } from './modules/auth/auth.commands';
import { IAuthQueries } from './modules/auth/auth.queries';
import { UserQueries } from './modules/user/user.queries';
import { accessAuthGuard } from './shared/infrastructure/middlewares/access-auth.guard';
import { optionalAccessAuthGuard } from './shared/infrastructure/middlewares/optional-access-auth.guard';
import { refreshGuard } from './shared/infrastructure/middlewares/refresh-auth.guard';

interface Deps {
  authCommands: AuthCommands;
  authQueries: IAuthQueries;
  userQueries: UserQueries;
}

export function createMiddlewares(deps: Deps) {
  const accessTokenGuard = accessAuthGuard(deps.authCommands, deps.userQueries);
  const optionalAccessGuard = optionalAccessAuthGuard(deps.authCommands, deps.userQueries);
  const refreshTokenGuard = refreshGuard(deps.authCommands, deps.authQueries, deps.userQueries);

  return {
    accessGuard: accessTokenGuard,
    optionalAccessGuard,
    refreshGuard: refreshTokenGuard,
  };
}
