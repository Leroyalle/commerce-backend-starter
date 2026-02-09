import Redis from 'ioredis';
import crypto from 'node:crypto';

import { IAuthCode } from '@/shared/types/auth-code.type';

interface Deps {
  redis: Redis;
}

export class CodeCommands {
  constructor(private readonly deps: Deps) {}
  public async create(data: Pick<IAuthCode, 'userId' | 'type'>) {
    const code = crypto.randomInt(1000, 10000);
    await this.deps.redis.set(`auth:code:${data.type}:${data.userId}`, code, 'EX', 60);
    return code;
  }
}
