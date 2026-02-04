import { RoleEnum } from '../infrastructure/db/schema/user.schema';

export type AccessPayload = {
  type: 'access';
  sub: string;
  role: RoleEnum;
};

export type RefreshPayload = {
  type: 'refresh';
  sub: string;
  jwi: string;
};

export type AuthTokensPayload = AccessPayload | RefreshPayload;
