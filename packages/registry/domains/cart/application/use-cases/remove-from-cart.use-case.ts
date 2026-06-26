import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import { CartNotActive } from "../../domain/errors/cart-not-active.error.js";
import { ItemNotInCart } from "../../domain/errors/item-not-in-cart.error.js";
import { ItemRemovedFromCart } from "../../domain/events/item-removed-from-cart.event.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";
import type { RemoveFromCartInput } from "../dto/remove-from-cart-input.dto.js";

export class RemoveFromCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(
    input: RemoveFromCartInput,
  ): Promise<Result<{ event: ItemRemovedFromCart }, CartNotFound | CartNotActive | ItemNotInCart>> {
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(input.cartId));
    }

    const removeResult = cart.removeItem(input.variantId);
    if (removeResult.isFail()) {
      return Result.fail(removeResult.unwrapError());
    }

    await this.cartRepository.update(removeResult.unwrap());

    const event = new ItemRemovedFromCart(input.cartId, input.variantId);
    return Result.ok({ event });
  }
}
