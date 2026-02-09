import Redis from 'ioredis';

import { IAuthCode } from '@/shared/types/auth-code.type';

interface Deps {
  redis: Redis;
}

export class CodeQueries {
  constructor(private readonly deps: Deps) {}

  public async findByUserId(data: Pick<IAuthCode, 'userId' | 'type'>) {
    return await this.deps.redis.get(`auth:code:${data.type}:${data.userId}`);
  }
}
