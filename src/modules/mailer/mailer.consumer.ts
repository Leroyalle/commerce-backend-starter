import Redis from 'ioredis';

import { BrokerQueues } from '@/shared/constants/broker-queues.constants';
import { createWorker } from '@/shared/infrastructure/broker/worker-factory';
import { TMailQueuePayload } from '@/shared/types/notification-queue-payload.type';
import { ISendEmailPayload } from '@/shared/types/send-email-payload.type';

import { IMailerService } from './mailer.service';

interface Deps {
  service: IMailerService;
  redis: Redis;
}

export function createConsumer(deps: Deps) {
  const consumer = createWorker<TMailQueuePayload['data'], void, TMailQueuePayload['name']>(
    BrokerQueues.EMAIL,
    async job => {
      switch (job.name) {
        case 'verify_email': {
          const data = job.data as Extract<TMailQueuePayload, { name: 'verify_email' }>['data'];
          const payload: ISendEmailPayload = {
            to: data.email,
            subject: 'Подтверждение почты',
            text: `Ваш верификационный код подтверждения почты - ${data.code}`,
          };
          return await deps.service.send(payload);
        }
        case 'reset_password': {
          const data = job.data as Extract<TMailQueuePayload, { name: 'reset_password' }>['data'];
          const payload: ISendEmailPayload = {
            to: data.email,
            subject: 'Подтверждение сброса пароля',
            text: `Код для сброса пароля - ${data.code}`,
          };
          return await deps.service.send(payload);
        }
        default:
          throw new Error(`Job ${job.name} is not handled in Auth Worker`);
      }
    },
    deps.redis,
  );

  return consumer;
}
