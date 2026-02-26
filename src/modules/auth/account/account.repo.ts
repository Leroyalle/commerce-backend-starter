import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import {
  Account,
  accountSchema,
  AccountWithRelations,
  credentialsAccountSchema,
  oauthAccountSchema,
} from '@/shared/infrastructure/db/schemes/account.schema';
import { ICreateAccount, IUpdateAccount } from '@/shared/types/auth/create-account.type';

import { ProviderName } from '../constants/providers-map.constant';

export interface IAccountRepository {
  findById(id: string): Promise<AccountWithRelations | undefined>;
  findByProviderAccount(
    provider: ProviderName,
    providerId: string,
  ): Promise<Omit<AccountWithRelations, 'credentialsAccount'> | undefined>;
  create(data: Omit<ICreateAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  update(id: string, data: IUpdateAccount): Promise<Account | undefined>;
}

export class AccountRepo implements IAccountRepository {
  public async findById(id: string): Promise<AccountWithRelations | undefined> {
    return await db.query.accountSchema.findFirst({
      where: eq(accountSchema.id, id),
      with: {
        oauthAccount: true,
        credentialsAccount: true,
      },
    });
  }

  public async findByProviderAccount(provider: ProviderName, providerId: string) {
    return await db.query.accountSchema.findFirst({
      where: (account, { and, eq, exists }) =>
        and(
          eq(account.provider, provider),
          exists(
            db
              .select()
              .from(oauthAccountSchema)
              .where(
                and(
                  eq(oauthAccountSchema.accountId, account.id),
                  eq(oauthAccountSchema.providerAccountId, providerId),
                ),
              ),
          ),
        ),
      with: {
        oauthAccount: true,
      },
    });
  }

  public async update(id: string, data: IUpdateAccount): Promise<Account | undefined> {
    return db.transaction(async tx => {
      if (data.account) {
        await tx.update(accountSchema).set(data.account).where(eq(accountSchema.id, id));
      }

      if (data.providerDetails.type === 'oauth') {
        await tx
          .update(oauthAccountSchema)
          .set({ providerAccountId: data.providerDetails.providerAccountId })
          .where(eq(oauthAccountSchema.accountId, id));
      } else if (data.providerDetails.type === 'credentials') {
        await tx
          .update(credentialsAccountSchema)
          .set({
            password: data.providerDetails.password,
            // isVerified: data.providerDetails.isVerified,
          })
          .where(eq(credentialsAccountSchema.accountId, id));
      }

      const fullAccount = await tx.query.accountSchema.findFirst({
        where: eq(accountSchema.id, id),
        with: {
          oauthAccount: true,
          credentialsAccount: true,
        },
      });

      return fullAccount;
    });
  }

  public async create(
    data: Omit<ICreateAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Account> {
    return db.transaction(async tx => {
      const [account] = await tx.insert(accountSchema).values(data.account).returning();
      if (data.providerDetails.type === 'oauth') {
        await tx
          .insert(oauthAccountSchema)
          .values({
            providerAccountId: data.providerDetails.providerAccountId,
            accountId: account.id,
          })
          .returning();
      } else if (data.providerDetails.type === 'credentials') {
        await tx
          .insert(credentialsAccountSchema)
          .values({
            accountId: account.id,
            password: data.providerDetails.password,
          })
          .returning();
      }

      return account;
    });
  }
}
