import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import {
  OauthAccount,
  oauthAccountSchema,
} from '@/shared/infrastructure/db/schema/oauth-account.schema';

export interface IOauthRepository {
  findById(id: string): Promise<OauthAccount | undefined>;
  create(data: Omit<OauthAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<OauthAccount>;
}

export class OauthRepo implements IOauthRepository {
  public async findById(id: string): Promise<OauthAccount | undefined> {
    return await db.query.oauthAccountSchema.findFirst({ where: eq(oauthAccountSchema.id, id) });
  }

  public async create(
    data: Omit<OauthAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OauthAccount> {
    return (await db.insert(oauthAccountSchema).values(data).returning())[0];
  }
}
