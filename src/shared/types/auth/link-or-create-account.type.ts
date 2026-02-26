import { Account } from '@/shared/infrastructure/db/schemes/account.schema';

export type TLinkOrCreateAccountResult =
  | {
      account: Account;
      action: AccountResultActions.CREATE;
    }
  | {
      account: Account;
      action: AccountResultActions.LINK;
    }
  | {
      account: Account;
      action: AccountResultActions.SEND_CODE;
    };

export enum AccountResultActions {
  LINK = 'link',
  CREATE = 'create',
  SEND_CODE = 'send_code',
}
