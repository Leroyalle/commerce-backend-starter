import { ContentfulStatusCode } from 'hono/utils/http-status';

import { ErrorCode } from './error-code-map';

export const ERROR_HTTP_STATUS: Record<ErrorCode, ContentfulStatusCode> = {
  INTERNAL_SERVER_ERROR: 500,
  VALIDATION_ERROR: 400,

  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,

  USER_NOT_VERIFIED: 403,
  USER_ALREADY_VERIFIED: 409,
  INVALID_PASSWORD: 401,
  SAME_PASSWORD: 400,
  TOKEN_EXPIRED: 401,
  INVALID_TOKEN: 401,
  INVALID_CODE: 400,
  ROLE_FORBIDDEN: 403,

  PRODUCT_OUT_OF_STOCK: 409,
  INSUFFICIENT_STOCK: 409,

  CART_IS_EMPTY: 400,
  CART_CREATION_FAILED: 500,
};
