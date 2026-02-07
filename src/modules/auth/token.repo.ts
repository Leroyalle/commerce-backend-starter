import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import {
  RefreshToken,
  refreshTokenSchema,
} from '@/shared/infrastructure/db/schema/refresh-token.schema';

export interface ITokenRepository {
  create: (token: Omit<RefreshToken, 'id'>) => Promise<RefreshToken>;
  findValidByUserId: (userId: string) => Promise<RefreshToken | undefined>;
}

export class TokenRepo implements ITokenRepository {
  public async create(token: Omit<RefreshToken, 'id'>) {
    return (await db.insert(refreshTokenSchema).values(token).returning())[0];
  }

  public async findValidByUserId(userId: string) {
    return await db.query.refreshTokenSchema.findFirst({
      where: and(eq(refreshTokenSchema.userId, userId), isNull(refreshTokenSchema.revokedAt)),
    });
  }
}
