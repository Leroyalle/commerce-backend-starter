import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';

import { createMiddlewares } from './middlewares';
import { createModules } from './modules';
import { createAuthRouter } from './modules/auth/auth.router';
import { createCartRouter } from './modules/cart/cart.router';
import { createCategoryRouter } from './modules/category/category.router';
import { createFavoritesRouter } from './modules/favorites/favorites.router';
import { createOrderRouter } from './modules/order/order.router';
import { createProductRouter } from './modules/product/product.router';
import { createUserRouter } from './modules/user/user.router';
import { SECURITY_SCHEMES } from './shared/constants/security-schemes.constants';
import { ERROR_HTTP_STATUS } from './shared/exceptions/error-status-map';
import { resolveErrorCode } from './shared/exceptions/resolve-error-code';
import { getEnv } from './shared/lib/helpers/get-env.helper';

const app = new OpenAPIHono().basePath('/api');

app.openAPIRegistry.registerComponent('securitySchemes', SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE, {
  type: 'apiKey',
  in: 'cookie',
  name: 'accessToken',
});

app.openAPIRegistry.registerComponent('securitySchemes', SECURITY_SCHEMES.REFRESH_TOKEN_COOKIE, {
  type: 'apiKey',
  in: 'cookie',
  name: 'refreshToken',
});

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Ecommerce Backend Starter',
    version: '1.0.0',
  },
  tags: [
    { name: 'Auth', description: 'Авторизация и аутентификация' },
    { name: 'Products', description: 'Работа с продуктами' },
    { name: 'Categories', description: 'Работа с категориями' },
    { name: 'Cart', description: 'Корзина пользователя' },
    { name: 'Orders', description: 'Заказы пользователя' },
    { name: 'Users', description: 'Работа с пользователями' },
  ],
});

app.get(
  '/docs',
  Scalar({
    url: '/api/openapi.json',
  }),
);

app.use(
  '*',
  cors({
    origin: [getEnv('FRONTEND_URL')],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowHeaders: ['Content-Type', 'Authorization'],
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

const { auth, cart, order, product, user, meilisearch, category, favorites } =
  await createModules();

const { accessGuard, refreshGuard, optionalAccessGuard } = createMiddlewares({
  authCommands: auth.commands,
  authQueries: auth.queries,
  userQueries: user.queries,
});

const userRouter = createUserRouter({
  commands: user.commands,
  queries: user.queries,
  accessAuthMiddleware: accessGuard,
});

const authRouter = createAuthRouter({
  commands: auth.commands,
  refreshGuard,
  accessGuard,
  optionalAccessGuard,
});

const favoritesRouter = createFavoritesRouter({
  accessAuthMiddleware: accessGuard,
  favoritesCommands: favorites.commands,
  favoritesQueries: favorites.queries,
  productQueries: product.queries,
  favoritesService: favorites.services,
});

const productRouter = createProductRouter({
  commands: product.commands,
  queries: product.queries,
  searchIndex: meilisearch.indexes.productIndex,
  favoritesQueries: favorites.queries,
  optionalAccessGuard,
});

const categoryRouter = createCategoryRouter({
  commands: category.commands,
  queries: category.queries,
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
app.route('/favorites', favoritesRouter);
app.route('/category', categoryRouter);
app.route('/cart', cartRouter);
app.route('/order', orderRouter);

export default app;
