import { GitHubUserResponse } from '@/shared/types/auth/oauth/github-user-info.type';
import { YandexUserinfo } from '@/shared/types/auth/oauth/yandex-user-info.type';

import { ProviderName } from './providers-map.constant';

export type TProvidersInfoMapConstant = {
  Yandex: YandexUserinfo;
  GitHub: GitHubUserResponse;
};

export type TOAuthProfileMapped = {
  [K in keyof TProvidersInfoMapConstant]: TOauthProfileMap<K>;
};

export type TOauthProfileMap<K extends ProviderName> = TProvidersInfoMapConstant[K] & {
  provider: K;
};
