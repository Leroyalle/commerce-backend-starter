import { ProviderName } from './providers-map.constant';

export const providersScopeMap: Record<ProviderName, string[]> = {
  GitHub: ['user:email'],
  Yandex: ['login:info', 'mail:smtp'],
};
