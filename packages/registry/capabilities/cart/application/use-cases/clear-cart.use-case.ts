import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";

export class ClearCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(cartId: string): Promise<Result<void, Error>> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(cartId));
    }

    const clearResult = cart.clear();
    if (clearResult.isFail()) {
      return Result.fail(clearResult.unwrapError());
    }

    await this.cartRepository.update(clearResult.unwrap());

    return Result.ok(undefined);
  }
}
