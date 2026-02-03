import { eq } from 'drizzle-orm';

import { db } from '@/shared/db/client';

import { User, userSchema } from '../../shared/db/schema/user.schema';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(user: Partial<Omit<User, 'id'>>): Promise<User>;
}

export class UserRepo implements IUserRepository {
  public async findById(id: string): Promise<User | null> {
    return (await db.select().from(userSchema).where(eq(userSchema.id, id)))[0];
  }

  public async findByEmail(email: string): Promise<User | null> {
    return (await db.select().from(userSchema).where(eq(userSchema.email, email)))[0];
  }

  public async create(user: Omit<User, 'id'>): Promise<User> {
    return (await db.insert(userSchema).values(user).returning())[0];
  }

  public async update(user: Partial<Omit<User, 'id'>>): Promise<User> {
    return (await db.update(userSchema).set(user).returning())[0];
  }
}
