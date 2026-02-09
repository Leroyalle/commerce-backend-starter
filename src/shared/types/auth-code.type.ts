export interface IAuthCode {
  code: string;
  type: 'verify_email' | 'reset_password';
  userId: string;
}
