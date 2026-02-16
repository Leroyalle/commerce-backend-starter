import {
  TOauthProfileMap,
  TOAuthProfileMapped,
} from '@/modules/auth/constants/providers-info-map.constant';
import { ProviderName } from '@/modules/auth/constants/providers-map.constant';

export function isYandexResponse(
  res: TOAuthProfileMapped[ProviderName],
): res is TOauthProfileMap<'Yandex'> {
  return res && 'provider' in res && res.provider === 'Yandex';
}
