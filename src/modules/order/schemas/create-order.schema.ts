import z from 'zod';

export const createOrderZodSchema = z.object({
  phone: z.string().regex(/^(\+7|8)[0-9]{10}$/, {
    message: 'Неверный формат номера. Используйте +7 или 8 и 10 цифр',
  }),
});
