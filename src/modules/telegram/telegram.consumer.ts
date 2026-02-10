import Redis from 'ioredis';

import { BrokerQueues } from '@/shared/constants/broker-queues.constants';
import { createWorker } from '@/shared/infrastructure/broker/worker-factory';
import { TTgQueuePayload } from '@/shared/types/notification-queue-payload.type';

import { ITelegramCommands } from './telegram.commands';

interface Deps {
  redis: Redis;
  telegramCommands: ITelegramCommands;
}

export function createTelegramConsumer(deps: Deps) {
  const consumer = createWorker<TTgQueuePayload['data'], void, TTgQueuePayload['name']>(
    BrokerQueues.TELEGRAM,
    async job => {
      try {
        switch (job.name) {
          case 'new_order_alert': {
            const data = job.data as Extract<TTgQueuePayload, { name: 'new_order_alert' }>['data'];
            await deps.telegramCommands.notifyAdminNewOrder(data.user, data.order);
          }
        }
        return;
      } catch (error) {
        console.log('TEELGRAM WORKER ERROR', error);
      }
    },
    deps.redis,
  );

  return consumer;
}
