import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getEnv } from '../../lib/helpers/get-env.helper';

import * as accountSchema from './schemes/account.schema';
import * as cartItemSchema from './schemes/cart-item.schema';
import * as cartSchema from './schemes/cart.schema';
import * as category from './schemes/category.schema';
import * as dataCounterSchema from './schemes/data-counter.schema';
import * as favoriteSchema from './schemes/favorite.schema';
import * as orderSchema from './schemes/order.schema';
import * as productSchema from './schemes/product.schema';
import * as productsToCategories from './schemes/products-to-categories.schema';
import * as refreshTokenSchema from './schemes/refresh-token.schema';
import * as userSchema from './schemes/user.schema';

const client = new Pool({
  host: getEnv('DB_HOST'),
  port: parseInt(getEnv('DB_PORT')),
  user: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_NAME'),
  ssl: false,
});

const schema = {
  ...cartSchema,
  ...userSchema,
  ...accountSchema,
  ...cartItemSchema,
  ...productSchema,
  ...orderSchema,
  ...refreshTokenSchema,
  ...dataCounterSchema,
  ...category,
  ...productsToCategories,
  ...favoriteSchema,
} as const;

export const db = drizzle(client, {
  schema,
});

export type DB = typeof db;
