import { ErrorCode } from './error-code-map';
import { DomainException } from './exceptions';
import { EXCEPTION_TO_CODE } from './exceptions-code-map';

export function resolveErrorCode(error: unknown): ErrorCode {
  if (!(error instanceof DomainException)) {
    return 'INTERNAL_SERVER_ERROR';
  }

  for (const [Exception, code] of EXCEPTION_TO_CODE) {
    if (error instanceof Exception) {
      return code;
    }
  }

  return 'INTERNAL_SERVER_ERROR';
}
