import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

export type MyContext = Context & ConversationFlavor<Context>;
