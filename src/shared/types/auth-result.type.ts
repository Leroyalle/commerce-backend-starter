import { SignReturnValue } from './sign-return-value.type';

export type SuccessAuthResult = {
  status: 'success';
} & AuthTokens;

type AuthTokens = {
  accessToken: SignReturnValue<'access'>;
  refreshToken: SignReturnValue<'refresh'>;
};
