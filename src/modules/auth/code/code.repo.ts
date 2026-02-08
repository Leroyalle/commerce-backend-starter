import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { AuthCode, authCodeSchema } from '@/shared/infrastructure/db/schema/auth-code.schema';

export interface ICodeRepository {
  create(data: Pick<AuthCode, 'code' | 'userId' | 'type'>): Promise<AuthCode>;
  findByUserId(userId: string): Promise<AuthCode | undefined>;
}

export class CodeRepo implements ICodeRepository {
  public async create(data: Pick<AuthCode, 'code' | 'userId' | 'type'>): Promise<AuthCode> {
    return (await db.insert(authCodeSchema).values(data).returning())[0];
  }

  public async findByUserId(userId: string): Promise<AuthCode | undefined> {
    return await db.query.authCodeSchema.findFirst({ where: eq(authCodeSchema.userId, userId) });
  }
}
