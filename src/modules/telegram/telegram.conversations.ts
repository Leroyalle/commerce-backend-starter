import type { Conversation } from '@grammyjs/conversations';
import z from 'zod';

import {
  createProductZodSchema,
  type TCreateProduct,
} from '../product/schemas/create-product.schema';

import type { MyContext } from './types/context.type';

export interface ITelegramConversations {
  createProductConversation: (
    conversation: Conversation<MyContext, MyContext>,
    ctx: MyContext,
  ) => Promise<void>;
  removeProductConversation: (
    conversation: Conversation<MyContext, MyContext>,
    ctx: MyContext,
  ) => Promise<void>;
}

interface Deps {
  createProduct: (data: TCreateProduct) => Promise<unknown>;
  removeProduct: (productId: string) => Promise<unknown>;
}

export class TelegramConversations implements ITelegramConversations {
  constructor(private readonly deps: Deps) {}

  public async createProductConversation(
    conversation: Conversation<MyContext, MyContext>,
    ctx: MyContext,
  ) {
    await ctx.reply('Пришли JSON массив продуктов');

    const { message } = await conversation.wait();

    if (!message?.text) {
      await ctx.reply('Ожидается текст.');
      return;
    }

    try {
      const raw = JSON.parse(message.text);
      const parsed = z.array(createProductZodSchema).parse(raw);

      if (!Array.isArray(parsed)) {
        await ctx.reply('Нужен массив.');
        return;
      }
      for (const product of parsed) {
        await this.deps.createProduct?.(product);
      }

      await ctx.reply('✔️ Готово. Продукт проиндексирован и создан.');
    } catch {
      await ctx.reply('❌ Невалидный JSON.');
    }
  }

  public async removeProductConversation(
    conversation: Conversation<MyContext, MyContext>,
    ctx: MyContext,
  ) {
    await ctx.reply('Пришли ID продукта');

    const { message } = await conversation.wait();

    if (!message?.text) {
      await ctx.reply('Ожидается текст.');
      return;
    }

    try {
      const productId = message.text;
      await this.deps.removeProduct(productId);
      await ctx.reply('✔️ Готово. Продукт удален.');
    } catch {
      await ctx.reply('❌ Невалидный ID. Либо продукт не найден.');
    }
  }
}
