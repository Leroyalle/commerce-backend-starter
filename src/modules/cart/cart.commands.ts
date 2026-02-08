import { Cart } from '@/shared/infrastructure/db/schema/cart.schema';

import { IProductQueries } from '../product/product.queries';

import { CartItemCommands } from './cart-item/cart-item.commands';
import { ICartRepository } from './cart.repo';

interface Deps {
  cartRepo: ICartRepository;
  cartItemCommands: CartItemCommands;
  productQueries: IProductQueries;
}

export class CartCommands {
  constructor(private readonly deps: Deps) {}

  public create(userId: string) {
    return this.deps.cartRepo.create(userId);
  }

  public update(cart: Partial<Omit<Cart, 'id'>>) {
    return this.deps.cartRepo.update(cart);
  }

  private async findOrCreateCart(userId: string) {
    let cart = await this.deps.cartRepo.findByUserId(userId);

    if (!cart) {
      const createdCart = await this.create(userId);
      cart = await this.deps.cartRepo.findByUserId(createdCart.id);
    }

    return cart;
  }

  public async addItem(userId: string, productId: string) {
    const cart = await this.findOrCreateCart(userId);

    if (!cart) {
      throw new Error('Не удалось создать или найти корзину');
    }

    const product = await this.deps.productQueries.findById(productId);

    if (!product) {
      throw new Error('Такого товара нет');
    }

    const findItem = cart.cartItems.find(item => item.productId === productId);

    if (findItem) {
      await this.deps.cartItemCommands.update(findItem.id, { quantity: findItem.quantity + 1 });
    }

    await this.deps.cartItemCommands.create({
      cartId: cart.id,
      productId,
      quantity: 1,
    });

    return await this.deps.cartRepo.findByUserId(userId);
  }

  public async removeItem(userId: string, cartItemId: string) {
    const cart = await this.findOrCreateCart(userId);

    if (!cart) {
      throw new Error('Не удалось создать или найти корзину');
    }

    const cartItem = cart.cartItems.find(item => item.id === cartItemId);

    if (!cartItem) {
      throw new Error('Товара в корзине нет');
    }

    await this.deps.cartItemCommands.delete(cartItem.id);

    return await this.deps.cartRepo.findByUserId(userId);
  }

  public async decrementItem(userId: string, cartItemId: string) {
    const cart = await this.findOrCreateCart(userId);

    if (!cart) {
      throw new Error('Не удалось создать или найти корзину');
    }

    const cartItem = cart.cartItems.find(item => item.id === cartItemId);

    if (!cartItem) {
      throw new Error('Товара в корзине нет');
    }

    if (cartItem.quantity > 1) {
      await this.deps.cartItemCommands.update(cartItem.id, { quantity: cartItem.quantity - 1 });
    }

    if (cartItem.quantity === 1) {
      await this.deps.cartItemCommands.delete(cartItem.id);
    }

    return await this.deps.cartRepo.findByUserId(userId);
  }

  public async clearCart(userId: string) {
    return await this.deps.cartRepo.clear(userId);
  }
}
