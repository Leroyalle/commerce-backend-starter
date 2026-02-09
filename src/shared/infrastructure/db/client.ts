import { drizzle } from 'drizzle-orm/node-postgres';

import { getEnv } from '../../lib/helpers/get-env.helper';

import * as cartItemSchema from './schema/cart-item.schema';
import * as cartSchema from './schema/cart.schema';
import * as dataCounterSchema from './schema/data-counter.schema';
import * as orderSchema from './schema/order.schema';
import * as productSchema from './schema/product.schema';
import * as refreshTokenSchema from './schema/refresh-token.schema';
import * as userSchema from './schema/user.schema';

export const db = drizzle(getEnv('DATABASE_URL'), {
  schema: {
    ...cartSchema,
    ...cartItemSchema,
    ...productSchema,
    ...userSchema,
    ...orderSchema,
    ...refreshTokenSchema,
    ...dataCounterSchema,
  },
});

export type DB = typeof db;
