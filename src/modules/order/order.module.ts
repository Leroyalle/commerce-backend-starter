import Redis from 'ioredis';

import { INotificationProducer } from '@/shared/infrastructure/broker/producers/notification.producer';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import type { CartCommands } from '../cart/cart.commands';
import { CartQueries } from '../cart/cart.queries';
import { UserQueries } from '../user/user.queries';

import { OrderCommands } from './order.commands';
import { OrderQueries } from './order.queries';
import { OrderRepo } from './order.repo';

interface Deps {
  cartQueries: CartQueries;
  cartCommands: CartCommands;
  userQueries: UserQueries;
  redis: Redis;
  notificationProducer: INotificationProducer;
}

export function createOrderModule(deps: Deps): CreateModuleResult<OrderCommands, OrderQueries> {
  const repository = new OrderRepo();
  const queries = new OrderQueries({ orderRepo: repository });

  const commands = new OrderCommands({
    orderRepo: repository,
    cartQueries: deps.cartQueries,
    cartCommands: deps.cartCommands,
    userQueries: deps.userQueries,
    notificationProducer: deps.notificationProducer,
  });

  return { commands, queries };
}
