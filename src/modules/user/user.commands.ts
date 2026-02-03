import { User } from '@/shared/db/schema/user.schema';

import { IUserRepository } from './user.repo';

export type UserCommandsDeps = {
  userRepo: IUserRepository;
};

export class UserCommands {
  constructor(private deps: UserCommandsDeps) {}

  public async create(user: Omit<User, 'id'>) {
    return await this.deps.userRepo.create(user);
  }

  public update(user: Partial<Omit<User, 'id'>>) {
    return this.deps.userRepo.update(user);
  }
}
