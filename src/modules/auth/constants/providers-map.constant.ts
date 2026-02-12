import { GitHub, Yandex } from 'arctic';

import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export const providersMap = {
  GitHub: new GitHub(
    getEnv('GITHUB_CLIENT_ID'),
    getEnv('GITHUB_CLIENT_SECRET'),
    'http://localhost:3000/auth/:provider/callback',
  ),
  Yandex: new Yandex(
    getEnv('YANDEX_CLIENT_ID'),
    getEnv('YANDEX_CLIENT_SECRET'),
    'http://localhost:3000/auth/:provider/callback',
  ),
} as const;

export type ProviderName = keyof typeof providersMap;
export type ProviderType = (typeof providersMap)[keyof typeof providersMap];
