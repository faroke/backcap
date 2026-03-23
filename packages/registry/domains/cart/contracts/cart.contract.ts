import type { Result } from "../shared/result.js";
import type { CartOutput } from "../application/dto/cart-output.dto.js";

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
  addToCart(input: CartAddItemInput): Promise<Result<void, Error>>;
  removeFromCart(input: CartRemoveItemInput): Promise<Result<void, Error>>;
  updateQuantity(input: CartUpdateQuantityInput): Promise<Result<void, Error>>;
  getCart(cartId: string): Promise<Result<CartOutput, Error>>;
  clearCart(cartId: string): Promise<Result<void, Error>>;
  abandonCart(cartId: string): Promise<Result<void, Error>>;
  convertCart(cartId: string): Promise<Result<void, Error>>;
}
