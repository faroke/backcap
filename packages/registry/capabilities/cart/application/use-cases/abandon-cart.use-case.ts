// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import { CartAbandoned } from "../../domain/events/cart-abandoned.event.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";

export class AbandonCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(cartId: string): Promise<Result<{ event: CartAbandoned }, Error>> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(cartId));
    }

    const abandonResult = cart.abandon();
    if (abandonResult.isFail()) {
      return Result.fail(abandonResult.unwrapError());
    }

    await this.cartRepository.update(abandonResult.unwrap());

    const event = new CartAbandoned(cartId);
    return Result.ok({ event });
  }
}
