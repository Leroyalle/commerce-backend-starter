import { AuthCode } from '@/shared/infrastructure/db/schema/auth-code.schema';

import { ICodeRepository } from './code.repo';

interface Deps {
  codeRepo: ICodeRepository;
}

export class CodeCommands {
  constructor(private readonly deps: Deps) {}
  public create(data: Pick<AuthCode, 'code' | 'userId' | 'type'>) {
    return this.deps.codeRepo.create(data);
  }
}
