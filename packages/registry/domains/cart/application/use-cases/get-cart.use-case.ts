import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import type { Cart } from "../../domain/entities/cart.entity.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";
import type { CartOutput, CartItemOutput } from "../dto/cart-output.dto.js";

function toCartOutput(cart: Cart): CartOutput {
  return {
    id: cart.id,
    userId: cart.userId,
    status: cart.status.value,
    items: cart.items.map(
      (item): CartItemOutput => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity.value,
        unitPriceCents: item.unitPriceCents,
        currency: item.currency,
        lineTotal: item.lineTotal,
      }),
    ),
    totalCents: cart.totalCents,
    itemCount: cart.itemCount,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

export class GetCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(cartId: string): Promise<Result<CartOutput, Error>> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(cartId));
    }

    return Result.ok(toCartOutput(cart));
  }
}
