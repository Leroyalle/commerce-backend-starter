import { ICartRepository } from './cart.repo';

interface Deps {
  cartRepo: ICartRepository;
}

export class CartQueries {
  constructor(private readonly deps: Deps) {}

  public findByUserId(userId: string) {
    return this.deps.cartRepo.findByUserId(userId);
  }
}
