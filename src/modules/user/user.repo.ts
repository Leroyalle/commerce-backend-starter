import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { AccountWithRelations } from '@/shared/infrastructure/db/schema/account.schema';

import { User, userSchema } from '../../shared/infrastructure/db/schema/user.schema';

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<(User & { accounts: AccountWithRelations[] }) | undefined>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User>;
}

export class UserRepo implements IUserRepository {
  public async findById(id: string): Promise<User | undefined> {
    return await db.query.userSchema.findFirst({ where: eq(userSchema.id, id) });
  }

  public async findByEmail(
    email: string,
  ): Promise<(User & { accounts: AccountWithRelations[] }) | undefined> {
    return await db.query.userSchema.findFirst({
      where: eq(userSchema.email, email),
      with: {
        accounts: {
          with: {
            credentialsAccount: true,
            oauthAccount: true,
          },
        },
      },
    });
  }

  public async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return (await db.insert(userSchema).values(user).returning())[0];
  }

  public async update(
    id: string,
    user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<User> {
    return (await db.update(userSchema).set(user).where(eq(userSchema.id, id)).returning())[0];
  }
}
