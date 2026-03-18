import { Result } from "../../shared/result.js";
import { OrderItem } from "./order-item.entity.js";
import { OrderStatus } from "../value-objects/order-status.vo.js";
import { Address } from "../value-objects/address.vo.js";
import { InvalidOrderTransition } from "../errors/invalid-order-transition.error.js";
import { OrderAlreadyCanceled } from "../errors/order-already-canceled.error.js";

export class Order {
  readonly id: string;
  readonly items: readonly OrderItem[];
  readonly status: OrderStatus;
  readonly shippingAddress: Address;
  readonly billingAddress: Address;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    items: readonly OrderItem[],
    status: OrderStatus,
    shippingAddress: Address,
    billingAddress: Address,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.items = items;
    this.status = status;
    this.shippingAddress = shippingAddress;
    this.billingAddress = billingAddress;
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
    items: OrderItem[];
    status?: string;
    shippingAddress: Address;
    billingAddress: Address;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Order, Error> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(new Error("Order ID is required"));
    }
    if (!params.items || params.items.length === 0) {
      return Result.fail(new Error("Order must have at least one item"));
    }

    let status: OrderStatus;
    if (params.status) {
      const statusResult = OrderStatus.from(params.status);
      if (statusResult.isFail()) {
        return Result.fail(statusResult.unwrapError());
      }
      status = statusResult.unwrap();
    } else {
      status = OrderStatus.pending();
    }

    const now = new Date();
    return Result.ok(
      new Order(
        params.id,
        [...params.items],
        status,
        params.shippingAddress,
        params.billingAddress,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  confirm(): Result<Order, Error> {
    if (this.status.isCanceled()) {
      return Result.fail(OrderAlreadyCanceled.create(this.id));
    }
    if (!this.status.canTransitionTo("confirmed")) {
      return Result.fail(InvalidOrderTransition.create(this.status.value, "confirmed"));
    }
    return Result.ok(
      new Order(this.id, this.items, OrderStatus.confirmed(), this.shippingAddress, this.billingAddress, this.createdAt, new Date()),
    );
  }

  ship(): Result<Order, Error> {
    if (this.status.isCanceled()) {
      return Result.fail(OrderAlreadyCanceled.create(this.id));
    }
    if (!this.status.canTransitionTo("shipped")) {
      return Result.fail(InvalidOrderTransition.create(this.status.value, "shipped"));
    }
    return Result.ok(
      new Order(this.id, this.items, OrderStatus.shipped(), this.shippingAddress, this.billingAddress, this.createdAt, new Date()),
    );
  }

  deliver(): Result<Order, Error> {
    if (!this.status.canTransitionTo("delivered")) {
      return Result.fail(InvalidOrderTransition.create(this.status.value, "delivered"));
    }
    return Result.ok(
      new Order(this.id, this.items, OrderStatus.delivered(), this.shippingAddress, this.billingAddress, this.createdAt, new Date()),
    );
  }

  cancel(): Result<Order, Error> {
    if (this.status.isCanceled()) {
      return Result.fail(OrderAlreadyCanceled.create(this.id));
    }
    if (!this.status.canTransitionTo("canceled")) {
      return Result.fail(InvalidOrderTransition.create(this.status.value, "canceled"));
    }
    return Result.ok(
      new Order(this.id, this.items, OrderStatus.canceled(), this.shippingAddress, this.billingAddress, this.createdAt, new Date()),
    );
  }

  process(): Result<Order, Error> {
    if (!this.status.canTransitionTo("processing")) {
      return Result.fail(InvalidOrderTransition.create(this.status.value, "processing"));
    }
    return Result.ok(
      new Order(this.id, this.items, OrderStatus.processing(), this.shippingAddress, this.billingAddress, this.createdAt, new Date()),
    );
  }
}
