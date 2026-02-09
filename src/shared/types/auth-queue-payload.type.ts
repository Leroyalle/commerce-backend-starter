export type TAuthQueuePayload =
  | { name: 'verify_email'; data: { email: string; code: number } }
  | { name: 'reset_password'; data: { email: string; token: string } };
