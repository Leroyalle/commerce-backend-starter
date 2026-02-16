import { SuccessAuthResult } from '../../auth-result.type';
import { AccountResultActions } from '../link-or-create-account.type';

export type TOauthLoginCallbackResult = (TOauthLinkOrCreate | TOauthSendCode) & { message: string };

type TOauthLinkOrCreate = {
  action: AccountResultActions.CREATE | AccountResultActions.LINK;
} & SuccessAuthResult;

type TOauthSendCode = {
  action: AccountResultActions.SEND_CODE;
  status: 'success';
};
