import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export interface ITelegramService {
  isAdmin: (chatId: number) => boolean;
}

export class TelegramService implements ITelegramService {
  public isAdmin(chatId: number) {
    const adminIds = getEnv('TELEGRAM_ADMIN_IDS')
      .split(',')
      .map(id => parseInt(id.trim()));

    return adminIds.includes(chatId);
  }
}
