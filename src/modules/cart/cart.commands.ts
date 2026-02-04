import { Cart } from '@/shared/db/schema/cart.schema';

import { ICartRepository } from './cart.repo';

interface Deps {
  cartRepo: ICartRepository;
}

export class CardCommands {
  constructor(private readonly deps: Deps) {}

  public create(userId: string) {
    return this.deps.cartRepo.create(userId);
  }

  public update(cart: Partial<Omit<Cart, 'id'>>) {
    return this.deps.cartRepo.update(cart);
  }

  public findById(id: string) {
    return this.deps.cartRepo.findById(id);
  }
}
