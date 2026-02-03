import { db } from '@/shared/db/client';
import { RefreshToken, refreshTokenSchema } from '@/shared/db/schema/refresh-token.schema';

export interface ITokenRepository {
  create: (token: Omit<RefreshToken, 'id'>) => Promise<RefreshToken>;
}

export class TokenRepo implements ITokenRepository {
  public async create(token: Omit<RefreshToken, 'id'>) {
    return (await db.insert(refreshTokenSchema).values(token).returning())[0];
  }
}
