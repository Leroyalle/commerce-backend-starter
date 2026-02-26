import { User } from '@/shared/infrastructure/db/schemes/user.schema';

import { IUserRepository } from './user.repo';

export type UserCommandsDeps = {
  userRepo: IUserRepository;
};

export class UserCommands {
  constructor(private deps: UserCommandsDeps) {}

  public async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.deps.userRepo.create(user);
  }

  public update(id: string, user: Partial<Omit<User, 'id'>>) {
    return this.deps.userRepo.update(id, user);
  }
}
