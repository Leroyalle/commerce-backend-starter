import { Hono } from 'hono';

import { createAuthModule } from './modules/auth/auth.module';
import { createAuthRouter } from './modules/auth/auth.router';
import { createProductModule } from './modules/product/product.module';
import { createProductRouter } from './modules/product/product.router';
import { createUserModule } from './modules/user/user.module';
import { createUserRouter } from './modules/user/user.router';
import { authMiddleware } from './shared/middlewares/auth.middleware';

const app = new Hono();

const userModule = createUserModule();
const authModule = createAuthModule({
  userCommands: userModule.commands,
  userQueries: userModule.queries,
});
const productModule = createProductModule();

const accessAuthMiddleware = authMiddleware(authModule.commands.verifyToken);

const userRouter = createUserRouter({
  commands: userModule.commands,
  queries: userModule.queries,
  accessAuthMiddleware,
});

const productRouter = createProductRouter({
  commands: productModule.commands,
  queries: productModule.queries,
});

const authRouter = createAuthRouter({ commands: authModule.commands });

app.route('/user', userRouter);
app.route('/auth', authRouter);
app.route('/product', productRouter);

app.get('/', c => {
  return c.text('Hello Hono!');
});

export default app;
