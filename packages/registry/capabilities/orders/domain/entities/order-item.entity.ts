import { Result } from "../../shared/result.js";

export class OrderItem {
  readonly id: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
  readonly createdAt: Date;

  private constructor(
    id: string,
    productId: string,
    quantity: number,
    unitPriceCents: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.productId = productId;
    this.quantity = quantity;
    this.unitPriceCents = unitPriceCents;
    this.createdAt = createdAt;
  }

  get lineTotal(): number {
    return this.unitPriceCents * this.quantity;
  }

  static create(params: {
    id: string;
    productId: string;
    quantity: number;
    unitPriceCents: number;
    createdAt?: Date;
  }): Result<OrderItem, Error> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(new Error("Order item ID is required"));
    }
    if (!params.productId || params.productId.trim().length === 0) {
      return Result.fail(new Error("Product ID is required"));
    }
    if (!Number.isInteger(params.quantity) || params.quantity < 1) {
      return Result.fail(new Error("Quantity must be a positive integer"));
    }
    if (!Number.isInteger(params.unitPriceCents) || params.unitPriceCents < 0) {
      return Result.fail(new Error("Unit price must be a non-negative integer (cents)"));
    }

    return Result.ok(
      new OrderItem(
        params.id,
        params.productId,
        params.quantity,
        params.unitPriceCents,
        params.createdAt ?? new Date(),
      ),
    );
  }
}
