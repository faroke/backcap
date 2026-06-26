import type { Result } from "../shared/result.js";
import type { CartOutput } from "../application/dto/cart-output.dto.js";
import type { CartNotFound } from "../domain/errors/cart-not-found.error.js";
import type { CartNotActive } from "../domain/errors/cart-not-active.error.js";
import type { CartLimitExceeded } from "../domain/errors/cart-limit-exceeded.error.js";
import type { ItemNotInCart } from "../domain/errors/item-not-in-cart.error.js";
import type { ProductNotFound } from "../domain/errors/product-not-found.error.js";
import type { UnexpectedCartState } from "../domain/errors/unexpected-cart-state.error.js";
import type { CurrencyMismatch } from "../domain/errors/currency-mismatch.error.js";
import type { InvalidQuantity } from "../domain/errors/invalid-quantity.error.js";
import type { InvalidUnitPrice } from "../domain/errors/invalid-unit-price.error.js";
import type { InvalidCurrency } from "../domain/errors/invalid-currency.error.js";
import type { InvalidCartItem } from "../domain/errors/invalid-cart-item.error.js";

export type { CartOutput } from "../application/dto/cart-output.dto.js";
export type { CartItemOutput } from "../application/dto/cart-output.dto.js";

export interface CartAddItemInput {
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartRemoveItemInput {
  cartId: string;
  variantId: string;
}

export interface CartUpdateQuantityInput {
  cartId: string;
  variantId: string;
  quantity: number;
}

export interface ICartService {
  addToCart(
    input: CartAddItemInput,
  ): Promise<
    Result<
      void,
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
  >;
  removeFromCart(
    input: CartRemoveItemInput,
  ): Promise<Result<void, CartNotFound | CartNotActive | ItemNotInCart>>;
  updateQuantity(
    input: CartUpdateQuantityInput,
  ): Promise<Result<void, CartNotFound | CartNotActive | ItemNotInCart | InvalidQuantity>>;
  getCart(cartId: string): Promise<Result<CartOutput, CartNotFound>>;
  clearCart(cartId: string): Promise<Result<void, CartNotFound | CartNotActive>>;
  abandonCart(cartId: string): Promise<Result<void, CartNotFound | CartNotActive>>;
  convertCart(cartId: string): Promise<Result<void, CartNotFound | CartNotActive>>;
}
