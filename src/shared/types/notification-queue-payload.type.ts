import { Order } from '../infrastructure/db/schema/order.schema';
import { User } from '../infrastructure/db/schema/user.schema';

export type TMailQueuePayload =
  | { name: 'verify_email'; data: { email: string; code: number } }
  | { name: 'reset_password'; data: { email: string; code: number } }
  | { name: 'order_confirmed_email'; data: { email: string; orderId: string } };

export type TTgQueuePayload =
  | { name: 'new_order_alert'; data: { user: User; order: Order } }
  | { name: 'status_update_alert'; data: { userId: string; message: string } }
  | { name: 'system_error_alert'; data: { error: string } };
