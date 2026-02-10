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

  public static User() {
    return new NotFoundException('Пользователь');
  }
  public static Product() {
    return new NotFoundException('Товар');
  }
  public static Order() {
    return new NotFoundException('Заказ');
  }
  public static Code() {
    return new NotFoundException('Код');
  }
  public static Token() {
    return new NotFoundException('Токен');
  }
}

export class AlreadyExistsException extends DomainException {
  constructor(entity: string) {
    super(`${entity} уже существует`);
  }

  public static User() {
    return new AlreadyExistsException('Пользователь');
  }
  public static Product() {
    return new AlreadyExistsException('Товар');
  }
  public static Order() {
    return new AlreadyExistsException('Заказ');
  }
}

export abstract class AuthException extends DomainException {}
export class UserNotVerifiedException extends AuthException {}
export class InvalidPasswordException extends AuthException {}
export class SamePasswordException extends AuthException {}
export class TokenExpiredException extends AuthException {}
export class InvalidTokenException extends AuthException {}
export class RoleForbiddenException extends AuthException {}
export class InvalidCodeException extends AuthException {}
export class UserAlreadyVerifiedException extends AuthException {}

export abstract class ProductException extends DomainException {}
export class ProductOutOfStockException extends ProductException {}
export class InsufficientStockException extends ProductException {}

export abstract class OrderException extends DomainException {}
export class CartIsEmptyException extends OrderException {}

export class InternalServerException extends DomainException {}
export class ValidationException extends DomainException {}
