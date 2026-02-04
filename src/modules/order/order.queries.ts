import { IOrderRepository } from './order.repo';

interface Deps {
  orderRepo: IOrderRepository;
}

export class OrderQueries {
  constructor(private readonly deps: Deps) {}

  public findAllByUserId(userId: string) {
    return this.deps.orderRepo.findAllByUserId(userId);
  }
}
