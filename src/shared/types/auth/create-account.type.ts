import {
  Account,
  CredentialsAccount,
  OauthAccount,
} from '@/shared/infrastructure/db/schema/account.schema';

import { DistributiveOmit } from '../distributive-omit.type';

export interface ICreateAccount {
  account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;
  providerDetails: DistributiveOmit<
    ({ type: 'oauth' } & OauthAccount) | (CredentialsAccount & { type: 'credentials' }),
    'accountId' | 'createdAt' | 'updatedAt'
  >;
}

export interface IUpdateAccount {
  account?: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;
  providerDetails: Partial<
    DistributiveOmit<
      ({ type: 'oauth' } & OauthAccount) | (CredentialsAccount & { type: 'credentials' }),
      'accountId' | 'createdAt' | 'updatedAt'
    >
  > & {
    type: 'oauth' | 'credentials';
  };
}
