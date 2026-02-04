import { CartItem } from '@/shared/infrastructure/db/schema/cart-item.schema';

import { ICartItemRepository } from './cart-item.repo';

interface Deps {
  cartItemRepo: ICartItemRepository;
}

export class CartItemCommands {
  constructor(private readonly deps: Deps) {}

  public create(item: Omit<CartItem, 'id'>) {
    return this.deps.cartItemRepo.create(item);
  }

  public update(id: string, item: Partial<Omit<CartItem, 'id'>>) {
    return this.deps.cartItemRepo.update(id, item);
  }

  public delete(id: string) {
    return this.deps.cartItemRepo.delete(id);
  }
}
