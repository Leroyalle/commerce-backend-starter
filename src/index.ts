import { Hono } from 'hono';

import { createAuthModule } from './modules/auth/auth.module';
import { createUserModule } from './modules/user/user.module';

const app = new Hono();

const userModule = createUserModule();
const authModule = createAuthModule({
  userCommands: userModule.commands,
  userQueries: userModule.queries,
});
app.route('/user', userModule.router);
app.route('/auth', authModule.router);

app.get('/', c => {
  return c.text('Hello Hono!');
});

export default app;
