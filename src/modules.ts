import { createAuthModule } from './modules/auth/auth.module';
import { createCartModule } from './modules/cart/cart.module';
import { createDataCounterModule } from './modules/data-counter/data-counter.module';
import { createMailerModule } from './modules/mailer/mailer.module';
import { createMeilisearchModule } from './modules/meilisearch/meilisearch.module';
import { createOrderModule } from './modules/order/order.module';
import { createProductModule } from './modules/product/product.module';
import { createTelegramModule } from './modules/telegram/telegram.module';
import { createUserModule } from './modules/user/user.module';
import { NotificationProducer } from './shared/infrastructure/broker/producers/notification.producer';
import { db } from './shared/infrastructure/db/client';
import { redis } from './shared/infrastructure/redis/client';

export async function createModules() {
  const meilisearch = await createMeilisearchModule();

  const notificationProducer = new NotificationProducer(redis);

  const mailer = createMailerModule({ redis });

  const telegram = createTelegramModule({ redis });

  const dataCounter = createDataCounterModule({ db: db });

  const user = createUserModule();

  const auth = createAuthModule({
    userCommands: user.commands,
    userQueries: user.queries,
    redis,
    notificationProducer,
  });
  const product = createProductModule({
    dataCounterQueries: dataCounter.queries,
    dataCounterCommands: dataCounter.commands,
    redis,
    searchIndex: meilisearch.indexes.productIndex,
  });

  const cart = createCartModule({ productQueries: product.queries });

  const order = createOrderModule({
    cartQueries: cart.queries,
    userQueries: user.queries,
    notificationProducer: notificationProducer,
    redis,
  });

  return {
    user,
    auth,
    product,
    cart,
    order,
    telegram,
    dataCounter,
    meilisearch,
    mailer,
  };
}
