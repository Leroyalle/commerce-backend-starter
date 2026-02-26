import { User } from '../infrastructure/db/schemes/user.schema';

export type AuthVars = {
  user: User;
  accountId: string;
  role?: 'user' | 'admin';
};

export type RefreshAuthVars = AuthVars & { jti: string };
