// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { CartItem } from "./cart-item.entity.js";
import { CartStatus } from "../value-objects/cart-status.vo.js";
import { CartLimitExceeded } from "../errors/cart-limit-exceeded.error.js";
import { ItemNotInCart } from "../errors/item-not-in-cart.error.js";

const DEFAULT_MAX_ITEMS = 50;

export class Cart {
  readonly id: string;
  readonly userId: string | null;
  readonly status: CartStatus;
  readonly items: readonly CartItem[];
  readonly maxItems: number;
  readonly currency: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    userId: string | null,
    status: CartStatus,
    items: readonly CartItem[],
    maxItems: number,
    currency: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.status = status;
    this.items = items;
    this.maxItems = maxItems;
    this.currency = currency;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get totalCents(): number {
    return this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  get itemCount(): number {
    return this.items.length;
  }

  static create(params: {
    id: string;
    userId?: string | null;
    status?: string;
    items?: CartItem[];
    maxItems?: number;
    currency?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Cart, Error> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(new Error("Cart ID is required"));
    }

    const maxItems = params.maxItems ?? DEFAULT_MAX_ITEMS;
    if (!Number.isInteger(maxItems) || maxItems < 1) {
      return Result.fail(new Error("maxItems must be a positive integer"));
    }

    let status: CartStatus;
    if (params.status) {
      const statusResult = CartStatus.from(params.status);
      if (statusResult.isFail()) {
        return Result.fail(statusResult.unwrapError());
      }
      status = statusResult.unwrap();
    } else {
      status = CartStatus.active();
    }

    const currency = (params.currency ?? "USD").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      return Result.fail(new Error(`Invalid ISO 4217 currency code: "${params.currency}"`));
    }

    const now = new Date();
    return Result.ok(
      new Cart(
        params.id,
        params.userId ?? null,
        status,
        [...(params.items ?? [])],
        maxItems,
        currency,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  addItem(params: {
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPriceCents: number;
    currency?: string;
  }): Result<Cart, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Cannot add items to a non-active cart"));
    }

    const itemCurrency = (params.currency ?? this.currency).toUpperCase();
    if (itemCurrency !== this.currency) {
      return Result.fail(new Error(`Currency mismatch: cart uses ${this.currency} but item uses ${itemCurrency}`));
    }

    const existing = this.items.find((i) => i.variantId === params.variantId);

    if (existing) {
      const newQty = existing.quantity.value + params.quantity;
      const updatedItemResult = existing.updateQuantity(newQty);
      if (updatedItemResult.isFail()) {
        return Result.fail(updatedItemResult.unwrapError());
      }

      let updated = updatedItemResult.unwrap();
      if (params.unitPriceCents !== existing.unitPriceCents) {
        const priceResult = updated.updatePrice(params.unitPriceCents, this.currency);
        if (priceResult.isFail()) {
          return Result.fail(priceResult.unwrapError());
        }
        updated = priceResult.unwrap();
      }

      const updatedItems = this.items.map((i) =>
        i.variantId === params.variantId ? updated : i,
      );

      return Result.ok(
        new Cart(this.id, this.userId, this.status, updatedItems, this.maxItems, this.currency, this.createdAt, new Date()),
      );
    }

    if (this.items.length >= this.maxItems) {
      return Result.fail(CartLimitExceeded.create(this.maxItems));
    }

    const itemResult = CartItem.create({
      id: params.id,
      productId: params.productId,
      variantId: params.variantId,
      quantity: params.quantity,
      unitPriceCents: params.unitPriceCents,
      currency: this.currency,
    });

    if (itemResult.isFail()) {
      return Result.fail(itemResult.unwrapError());
    }

    return Result.ok(
      new Cart(
        this.id,
        this.userId,
        this.status,
        [...this.items, itemResult.unwrap()],
        this.maxItems,
        this.currency,
        this.createdAt,
        new Date(),
      ),
    );
  }

  removeItem(variantId: string): Result<Cart, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Cannot remove items from a non-active cart"));
    }

    const exists = this.items.find((i) => i.variantId === variantId);
    if (!exists) {
      return Result.fail(ItemNotInCart.create(variantId));
    }

    const filtered = this.items.filter((i) => i.variantId !== variantId);
    return Result.ok(
      new Cart(this.id, this.userId, this.status, filtered, this.maxItems, this.currency, this.createdAt, new Date()),
    );
  }

  updateItemQuantity(variantId: string, newQuantity: number): Result<Cart, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Cannot update items in a non-active cart"));
    }

    const existing = this.items.find((i) => i.variantId === variantId);
    if (!existing) {
      return Result.fail(ItemNotInCart.create(variantId));
    }

    const updatedItemResult = existing.updateQuantity(newQuantity);
    if (updatedItemResult.isFail()) {
      return Result.fail(updatedItemResult.unwrapError());
    }

    const updatedItems = this.items.map((i) =>
      i.variantId === variantId ? updatedItemResult.unwrap() : i,
    );

    return Result.ok(
      new Cart(this.id, this.userId, this.status, updatedItems, this.maxItems, this.currency, this.createdAt, new Date()),
    );
  }

  clear(): Result<Cart, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Cannot clear a non-active cart"));
    }

    return Result.ok(
      new Cart(this.id, this.userId, this.status, [], this.maxItems, this.currency, this.createdAt, new Date()),
    );
  }

  abandon(): Result<Cart, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Only active carts can be abandoned"));
    }

    return Result.ok(
      new Cart(this.id, this.userId, CartStatus.abandoned(), this.items, this.maxItems, this.currency, this.createdAt, new Date()),
    );
  }

  convert(): Result<Cart, Error> {
    if (!this.status.isActive()) {
      return Result.fail(new Error("Only active carts can be converted"));
    }

    return Result.ok(
      new Cart(this.id, this.userId, CartStatus.converted(), this.items, this.maxItems, this.currency, this.createdAt, new Date()),
    );
  }
}
