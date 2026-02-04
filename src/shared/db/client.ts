import { drizzle } from 'drizzle-orm/node-postgres';

import { cartItemSchema } from './schema/cart-item.schema';
import { cartSchema } from './schema/cart.schema';
import { orderSchema } from './schema/order.schema';
import { productSchema } from './schema/product.schema';
import { refreshTokenSchema } from './schema/refresh-token.schema';
import { userSchema } from './schema/user.schema';

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    cartSchema,
    cartItemSchema,
    productSchema,
    userSchema,
    refreshTokenSchema,
    orderSchema,
  },
});
