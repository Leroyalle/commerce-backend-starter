import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';

import { User, userSchema } from '../../shared/infrastructure/db/schema/user.schema';

export interface IUserRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(user: Partial<Omit<User, 'id'>>): Promise<User>;
}

export class UserRepo implements IUserRepository {
  public async findById(id: string): Promise<User | undefined> {
    return await db.query.userSchema.findFirst({ where: eq(userSchema.id, id) });
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return await db.query.userSchema.findFirst({ where: eq(userSchema.email, email) });
  }

  public async create(user: Omit<User, 'id'>): Promise<User> {
    return (await db.insert(userSchema).values(user).returning())[0];
  }

  public async update(user: Partial<Omit<User, 'id'>>): Promise<User> {
    return (await db.update(userSchema).set(user).returning())[0];
  }
}
