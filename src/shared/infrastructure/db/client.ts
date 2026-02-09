import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import { getEnv } from '../../lib/helpers/get-env.helper';

import * as cartItemSchema from './schema/cart-item.schema';
import * as cartSchema from './schema/cart.schema';
import * as dataCounterSchema from './schema/data-counter.schema';
import * as orderSchema from './schema/order.schema';
import * as productSchema from './schema/product.schema';
import * as refreshTokenSchema from './schema/refresh-token.schema';
import * as userSchema from './schema/user.schema';

const client = new Client({
  host: getEnv('DB_HOST'),
  port: parseInt(getEnv('DB_PORT')),
  user: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_NAME'),
  ssl: false,
});

const schema = {
  ...cartSchema,
  ...cartItemSchema,
  ...productSchema,
  ...userSchema,
  ...orderSchema,
  ...refreshTokenSchema,
  ...dataCounterSchema,
};

export const db = drizzle(client, { schema });

export type DB = typeof db;
