import { createWorker } from '@/shared/infrastructure/bullmq/worker-factory';
import { createMailerClient } from '@/shared/infrastructure/mailer/client-factory';
import { AuthJobNames } from '@/shared/types/auth-queue-payload.type';
import { ISendEmailPayload } from '@/shared/types/send-email-payload.type';

import { MailerService } from './mailer.service';

export function createMailerModule() {
  const client = createMailerClient();
  const service = new MailerService(client);
  const consumer = createWorker<ISendEmailPayload, void, AuthJobNames>(
    'auth',
    async job => {
      switch (job.name) {
        case 'verify_email':
          return await service.send(job.data);
        default:
          throw new Error(`Job ${job.name} is not handled in Auth Worker`);
      }
    },
    {},
  );
  return { service, worker: consumer };
}
