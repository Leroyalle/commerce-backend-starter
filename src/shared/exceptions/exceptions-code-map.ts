import { ERROR_CODE, ErrorCode } from './error-code-map';
import {
  AlreadyExistsException,
  CartCreationFailedException,
  CartIsEmptyException,
  DomainException,
  InsufficientStockException,
  InternalServerException,
  InvalidCodeException,
  InvalidPasswordException,
  InvalidTokenException,
  NotFoundException,
  ProductOutOfStockException,
  RoleForbiddenException,
  SamePasswordException,
  TokenExpiredException,
  UserAlreadyVerifiedException,
  UserNotVerifiedException,
  ValidationException,
} from './exceptions';

export const EXCEPTION_TO_CODE = new Map<new (...args: any[]) => DomainException, ErrorCode>([
  [NotFoundException, ERROR_CODE.NOT_FOUND],
  [AlreadyExistsException, ERROR_CODE.ALREADY_EXISTS],

  [UserNotVerifiedException, ERROR_CODE.USER_NOT_VERIFIED],
  [UserAlreadyVerifiedException, ERROR_CODE.USER_ALREADY_VERIFIED],
  [InvalidPasswordException, ERROR_CODE.INVALID_PASSWORD],
  [SamePasswordException, ERROR_CODE.SAME_PASSWORD],
  [TokenExpiredException, ERROR_CODE.TOKEN_EXPIRED],
  [InvalidTokenException, ERROR_CODE.INVALID_TOKEN],
  [InvalidCodeException, ERROR_CODE.INVALID_CODE],
  [RoleForbiddenException, ERROR_CODE.ROLE_FORBIDDEN],

  [ProductOutOfStockException, ERROR_CODE.PRODUCT_OUT_OF_STOCK],
  [InsufficientStockException, ERROR_CODE.INSUFFICIENT_STOCK],

  [CartIsEmptyException, ERROR_CODE.CART_IS_EMPTY],
  [CartCreationFailedException, ERROR_CODE.CART_CREATION_FAILED],

  [ValidationException, ERROR_CODE.VALIDATION_ERROR],
  [InternalServerException, ERROR_CODE.INTERNAL_SERVER_ERROR],
]);
