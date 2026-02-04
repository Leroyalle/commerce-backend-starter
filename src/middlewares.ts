import { JWTHeaderParameters, JWTPayload } from 'jose';

import { accessAuthMiddleware } from './shared/infrastructure/middlewares/access-auth.middleware';
import { AccessPayload, RefreshPayload } from './shared/types/token-payload.type';

export function createMiddlewares(authCommands: {
  verifyToken: <T extends 'access' | 'refresh'>(
    token: string,
    type: T,
  ) => Promise<{
    payload: JWTPayload & (T extends 'access' ? AccessPayload : RefreshPayload);
    protectedHeader: JWTHeaderParameters;
  }>;
}) {
  const accessAuth = accessAuthMiddleware(authCommands.verifyToken);

  return {
    accessAuth,
  };
}
