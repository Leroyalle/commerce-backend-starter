export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export abstract class AuthException extends DomainException {}
export class UserNotFoundException extends AuthException {}
export class UserAlreadyExistsException extends AuthException {}
export class InvalidPasswordException extends AuthException {}
export class TokenExpiredException extends AuthException {}
export class InvalidTokenException extends AuthException {}
export class RoleForbiddenException extends AuthException {}

export abstract class ProductException extends DomainException {}
export class ProductNotFoundException extends ProductException {}
export class CategoryNotFoundException extends ProductException {}
export class ProductOutOfStockException extends ProductException {}
export class InsufficientStockException extends ProductException {}

export abstract class OrderException extends DomainException {}
export class OrderNotFoundException extends OrderException {}
export class CartIsEmptyException extends OrderException {}

export class InternalServerException extends DomainException {}
export class ValidationException extends DomainException {}
