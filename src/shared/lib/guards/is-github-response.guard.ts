import {
  TOauthProfileMap,
  TOAuthProfileMapped,
} from '@/modules/auth/constants/providers-info-map.constant';
import { ProviderName } from '@/modules/auth/constants/providers-map.constant';

export function isGithubResponse(
  res: TOAuthProfileMapped[ProviderName],
): res is TOauthProfileMap<'GitHub'> {
  return res && 'provider' in res && res.provider === 'GitHub';
}
