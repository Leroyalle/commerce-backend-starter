import { GitHubUserAuthDTO } from '@/shared/types/auth/oauth/github-user-info.type';
import { YandexUserinfo } from '@/shared/types/auth/oauth/yandex-user-info.type';

export type TProvidersInfoMapConstant = {
  Yandex: YandexUserinfo;
  GitHub: GitHubUserAuthDTO;
};
