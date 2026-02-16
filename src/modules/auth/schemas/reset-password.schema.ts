import { loginZodSchema } from './login.schema';

export const resetPasswordZodSchema = loginZodSchema.pick({ password: true });
