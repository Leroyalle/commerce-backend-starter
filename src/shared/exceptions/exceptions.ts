export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundException extends DomainException {
  constructor(entity: string) {
    super(`${entity} не найден`);
  }
}

export class AlreadyExistsException extends DomainException {
  constructor(entity: string) {
    super(`${entity} уже существует`);
  }
}

export abstract class AuthException extends DomainException {}
export class UserNotVerifiedException extends AuthException {}
export class InvalidPasswordException extends AuthException {}
export class SamePasswordException extends AuthException {}
export class TokenExpiredException extends AuthException {}
export class InvalidTokenException extends AuthException {}
export class RoleForbiddenException extends AuthException {}

export abstract class ProductException extends DomainException {}
export class ProductOutOfStockException extends ProductException {}
export class InsufficientStockException extends ProductException {}

export abstract class OrderException extends DomainException {}
export class CartIsEmptyException extends OrderException {}

export class InternalServerException extends DomainException {}
export class ValidationException extends DomainException {}
