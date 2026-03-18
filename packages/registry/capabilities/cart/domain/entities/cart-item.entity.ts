// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Quantity } from "../value-objects/quantity.vo.js";

const CURRENCY_REGEX = /^[A-Z]{3}$/;

export class CartItem {
  readonly id: string;
  readonly productId: string;
  readonly variantId: string;
  readonly quantity: Quantity;
  readonly unitPriceCents: number;
  readonly currency: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    productId: string,
    variantId: string,
    quantity: Quantity,
    unitPriceCents: number,
    currency: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.productId = productId;
    this.variantId = variantId;
    this.quantity = quantity;
    this.unitPriceCents = unitPriceCents;
    this.currency = currency;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get lineTotal(): number {
    return this.unitPriceCents * this.quantity.value;
  }

  static create(params: {
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPriceCents: number;
    currency?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<CartItem, Error> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(new Error("Cart item ID is required"));
    }
    if (!params.productId || params.productId.trim().length === 0) {
      return Result.fail(new Error("Product ID is required"));
    }
    if (!params.variantId || params.variantId.trim().length === 0) {
      return Result.fail(new Error("Variant ID is required"));
    }
    if (!Number.isInteger(params.unitPriceCents) || params.unitPriceCents < 0) {
      return Result.fail(new Error("Unit price must be a non-negative integer (cents)"));
    }

    const currency = (params.currency ?? "USD").toUpperCase();
    if (!CURRENCY_REGEX.test(currency)) {
      return Result.fail(new Error(`Invalid ISO 4217 currency code: "${params.currency}"`));
    }

    const quantityResult = Quantity.create(params.quantity);
    if (quantityResult.isFail()) {
      return Result.fail(quantityResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new CartItem(
        params.id,
        params.productId,
        params.variantId,
        quantityResult.unwrap(),
        params.unitPriceCents,
        currency,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  updateQuantity(newQuantity: number): Result<CartItem, Error> {
    const quantityResult = Quantity.create(newQuantity);
    if (quantityResult.isFail()) {
      return Result.fail(quantityResult.unwrapError());
    }
    return Result.ok(
      new CartItem(
        this.id,
        this.productId,
        this.variantId,
        quantityResult.unwrap(),
        this.unitPriceCents,
        this.currency,
        this.createdAt,
        new Date(),
      ),
    );
  }

  updatePrice(newPriceCents: number, newCurrency: string): Result<CartItem, Error> {
    if (!Number.isInteger(newPriceCents) || newPriceCents < 0) {
      return Result.fail(new Error("Unit price must be a non-negative integer (cents)"));
    }
    const upper = newCurrency.toUpperCase();
    if (!CURRENCY_REGEX.test(upper)) {
      return Result.fail(new Error(`Invalid ISO 4217 currency code: "${newCurrency}"`));
    }
    return Result.ok(
      new CartItem(
        this.id,
        this.productId,
        this.variantId,
        this.quantity,
        newPriceCents,
        upper,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
