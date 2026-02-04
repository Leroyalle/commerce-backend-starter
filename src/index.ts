import { Hono } from 'hono';

import { createAuthModule } from './modules/auth/auth.module';
import { createAuthRouter } from './modules/auth/auth.router';
import { createCartModule } from './modules/cart/cart.module';
import { createCartRouter } from './modules/cart/cart.router';
import { createOrderModule } from './modules/order/order.module';
import { createOrderRouter } from './modules/order/order.router';
import { createProductModule } from './modules/product/product.module';
import { createProductRouter } from './modules/product/product.router';
import { createUserModule } from './modules/user/user.module';
import { createUserRouter } from './modules/user/user.router';
import { accessAuthMiddleware } from './shared/middlewares/access-auth.middleware';

const app = new Hono();

app.onError((err, c) => {
  return c.json({ message: err.message }, 404);
});

const userModule = createUserModule();
const authModule = createAuthModule({
  userCommands: userModule.commands,
  userQueries: userModule.queries,
});
const productModule = createProductModule();
const cartModule = createCartModule({ productQueries: productModule.queries });
const orderModule = createOrderModule({
  cartQueries: cartModule.queries,
});

const requiredAccess = accessAuthMiddleware(authModule.commands.verifyToken);

const userRouter = createUserRouter({
  commands: userModule.commands,
  queries: userModule.queries,
  accessAuthMiddleware: requiredAccess,
});
const authRouter = createAuthRouter({ commands: authModule.commands });
const productRouter = createProductRouter({
  commands: productModule.commands,
  queries: productModule.queries,
});
const cartRouter = createCartRouter({
  commands: cartModule.commands,
  queries: cartModule.queries,
  accessAuthMiddleware: requiredAccess,
});
const orderRouter = createOrderRouter({
  queries: orderModule.queries,
  commands: orderModule.commands,
  accessAuthMiddleware: requiredAccess,
});

app.route('/user', userRouter);
app.route('/auth', authRouter);
app.route('/product', productRouter);
app.route('/cart', cartRouter);
app.route('/order', orderRouter);

app.get('/', c => {
  return c.text('Hello Hono!');
});

export default app;
