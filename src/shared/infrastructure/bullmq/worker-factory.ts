import { ConnectionOptions, Processor, Worker } from 'bullmq';

export function createWorker<T = any>(
  name: string,
  processor: Processor<T>,
  connection: ConnectionOptions,
  opts?: Omit<WorkerOptions, 'connection'>,
) {
  return new Worker<T>(name, processor, {
    connection,
    ...opts,
    limiter: {
      max: 1,
      duration: 5000,
    },
  });
}
