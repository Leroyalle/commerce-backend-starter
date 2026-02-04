import { db } from '@/shared/infrastructure/db/client';
import {
  RefreshToken,
  refreshTokenSchema,
} from '@/shared/infrastructure/db/schema/refresh-token.schema';

export interface ITokenRepository {
  create: (token: Omit<RefreshToken, 'id'>) => Promise<RefreshToken>;
}

export class TokenRepo implements ITokenRepository {
  public async create(token: Omit<RefreshToken, 'id'>) {
    return (await db.insert(refreshTokenSchema).values(token).returning())[0];
  }
}
