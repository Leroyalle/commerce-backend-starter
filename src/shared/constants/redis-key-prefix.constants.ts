export const RedisKeyPrefix = {
  PRODUCT: 'product',
} as const;

export type TRedisKeys = (typeof RedisKeyPrefix)[keyof typeof RedisKeyPrefix];
