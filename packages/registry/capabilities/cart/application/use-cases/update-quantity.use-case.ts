import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";
import type { UpdateQuantityInput } from "../dto/update-quantity-input.dto.js";

export class UpdateQuantity {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(input: UpdateQuantityInput): Promise<Result<void, Error>> {
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(input.cartId));
    }

    const updateResult = cart.updateItemQuantity(input.variantId, input.quantity);
    if (updateResult.isFail()) {
      return Result.fail(updateResult.unwrapError());
    }

    await this.cartRepository.update(updateResult.unwrap());

    return Result.ok(undefined);
  }
}
