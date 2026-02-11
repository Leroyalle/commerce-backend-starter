import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { createMiddlewares } from './middlewares';
import { createModules } from './modules';
import { createAuthRouter } from './modules/auth/auth.router';
import { createCartRouter } from './modules/cart/cart.router';
import { createOrderRouter } from './modules/order/order.router';
import { createProductRouter } from './modules/product/product.router';
import { createUserRouter } from './modules/user/user.router';
import { ERROR_HTTP_STATUS } from './shared/exceptions/error-status-map';
import { resolveErrorCode } from './shared/exceptions/resolve-error-code';

const app = new Hono().basePath('/api');

app.use(
  '*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowHeaders: ['Content-Type', 'Authorization'],
    // exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  }),
);

app.onError((err, c) => {
  console.error('ERROR MESSAGE:', err.message);
  console.error('ERROR STACK:', err.stack);
  if (err.cause) console.error('ERROR CAUSE:', err.cause);

  const code = resolveErrorCode(err);
  const status = ERROR_HTTP_STATUS[code];

  return c.json(
    {
      message: err.message,
      code,
    },
    status,
  );
});

const { auth, cart, order, product, user, meilisearch } = await createModules();
const { accessGuard, refreshGuard } = createMiddlewares({ authCommands: auth.commands });

const userRouter = createUserRouter({
  commands: user.commands,
  queries: user.queries,
  accessAuthMiddleware: accessGuard,
});

const authRouter = createAuthRouter({ commands: auth.commands, refreshGuard, accessGuard });

const productRouter = createProductRouter({
  commands: product.commands,
  queries: product.queries,
  searchIndex: meilisearch.indexes.productIndex,
});

const cartRouter = createCartRouter({
  commands: cart.commands,
  queries: cart.queries,
  accessAuthMiddleware: accessGuard,
});

const orderRouter = createOrderRouter({
  queries: order.queries,
  commands: order.commands,
  accessAuthMiddleware: accessGuard,
});

app.route('/user', userRouter);
app.route('/auth', authRouter);
app.route('/product', productRouter);
app.route('/cart', cartRouter);
app.route('/order', orderRouter);

export default app;
