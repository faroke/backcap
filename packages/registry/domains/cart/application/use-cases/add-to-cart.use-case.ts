import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import { UnexpectedCartState } from "../../domain/errors/unexpected-cart-state.error.js";
import { CartNotActive } from "../../domain/errors/cart-not-active.error.js";
import { CurrencyMismatch } from "../../domain/errors/currency-mismatch.error.js";
import { CartLimitExceeded } from "../../domain/errors/cart-limit-exceeded.error.js";
import { InvalidQuantity } from "../../domain/errors/invalid-quantity.error.js";
import { InvalidUnitPrice } from "../../domain/errors/invalid-unit-price.error.js";
import { InvalidCurrency } from "../../domain/errors/invalid-currency.error.js";
import { InvalidCartItem } from "../../domain/errors/invalid-cart-item.error.js";
import { ItemAddedToCart } from "../../domain/events/item-added-to-cart.event.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";
import type { IProductPriceLookup } from "../ports/product-price-lookup.port.js";
import type { AddToCartInput } from "../dto/add-to-cart-input.dto.js";

export class AddToCart {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly priceLookup: IProductPriceLookup,
  ) {}

  async execute(
    input: AddToCartInput,
  ): Promise<
    Result<
      { event: ItemAddedToCart },
      | CartNotFound
      | ProductNotFound
      | UnexpectedCartState
      | CartNotActive
      | CurrencyMismatch
      | CartLimitExceeded
      | InvalidQuantity
      | InvalidUnitPrice
      | InvalidCurrency
      | InvalidCartItem
    >
  > {
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(input.cartId));
    }

    const priceInfo = await this.priceLookup.getPrice(input.productId, input.variantId);
    if (!priceInfo) {
      return Result.fail(ProductNotFound.create(input.productId, input.variantId));
    }

    const itemId = crypto.randomUUID();
    const addResult = cart.addItem({
      id: itemId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitPriceCents: priceInfo.priceCents,
      currency: priceInfo.currency,
    });

    if (addResult.isFail()) {
      return Result.fail(addResult.unwrapError());
    }

    const updatedCart = addResult.unwrap();
    await this.cartRepository.update(updatedCart);

    const updatedItem = updatedCart.items.find(
      (i) => i.variantId === input.variantId && i.productId === input.productId,
    );
    if (!updatedItem) {
      return Result.fail(UnexpectedCartState.create("Unexpected: item not found in cart after add"));
    }
    const event = new ItemAddedToCart(input.cartId, input.variantId, updatedItem.quantity.value);
    return Result.ok({ event });
  }
}
