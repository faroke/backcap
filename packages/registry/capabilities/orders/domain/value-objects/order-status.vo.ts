import { Result } from "../../shared/result.js";

export type OrderStatusValue =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "refunded";

const VALID_TRANSITIONS: Record<OrderStatusValue, readonly OrderStatusValue[]> = {
  pending: ["confirmed", "canceled"],
  confirmed: ["processing", "canceled"],
  processing: ["shipped", "canceled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  canceled: [],
  refunded: [],
};

export class OrderStatus {
  readonly value: OrderStatusValue;

  private constructor(value: OrderStatusValue) {
    this.value = value;
  }

  static pending(): OrderStatus {
    return new OrderStatus("pending");
  }

  static confirmed(): OrderStatus {
    return new OrderStatus("confirmed");
  }

  static processing(): OrderStatus {
    return new OrderStatus("processing");
  }

  static shipped(): OrderStatus {
    return new OrderStatus("shipped");
  }

  static delivered(): OrderStatus {
    return new OrderStatus("delivered");
  }

  static canceled(): OrderStatus {
    return new OrderStatus("canceled");
  }

  static refunded(): OrderStatus {
    return new OrderStatus("refunded");
  }

  static from(value: string): Result<OrderStatus, Error> {
    if (
      value === "pending" ||
      value === "confirmed" ||
      value === "processing" ||
      value === "shipped" ||
      value === "delivered" ||
      value === "canceled" ||
      value === "refunded"
    ) {
      return Result.ok(new OrderStatus(value));
    }
    return Result.fail(new Error(`Invalid order status: "${value}"`));
  }

  canTransitionTo(target: OrderStatusValue): boolean {
    return VALID_TRANSITIONS[this.value].includes(target);
  }

  isPending(): boolean {
    return this.value === "pending";
  }

  isConfirmed(): boolean {
    return this.value === "confirmed";
  }

  isProcessing(): boolean {
    return this.value === "processing";
  }

  isShipped(): boolean {
    return this.value === "shipped";
  }

  isDelivered(): boolean {
    return this.value === "delivered";
  }

  isCanceled(): boolean {
    return this.value === "canceled";
  }

  isRefunded(): boolean {
    return this.value === "refunded";
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
