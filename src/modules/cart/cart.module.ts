import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { IProductQueries } from '../product/product.queries';

import { CartItemCommands } from './cart-item/cart-item.commands';
import { CartItemRepo } from './cart-item/cart-item.repo';
import { CartCommands } from './cart.commands';
import { CartQueries } from './cart.queries';
import { CartRepository } from './cart.repo';

interface Deps {
  productQueries: IProductQueries;
}

export function createCartModule(deps: Deps): CreateModuleResult<CartCommands, CartQueries> {
  const cartItemRepo = new CartItemRepo();
  const cartItemCommands = new CartItemCommands({ cartItemRepo });

  const cartRepo = new CartRepository();
  const cartQueries = new CartQueries({ cartRepo });
  const cartCommands = new CartCommands({
    cartRepo,
    cartItemCommands,
    productQueries: deps.productQueries,
  });

  return {
    commands: cartCommands,
    queries: cartQueries,
  };
}
