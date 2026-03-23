import { describe, it, expect } from "vitest";
import { Order } from "../entities/order.entity.js";
import { OrderItem } from "../entities/order-item.entity.js";
import { Address } from "../value-objects/address.vo.js";

describe("Order entity", () => {
  const shippingAddress = Address.create({
    street: "123 Main St",
    city: "Paris",
    country: "France",
    postalCode: "75001",
  }).unwrap();

  const billingAddress = Address.create({
    street: "456 Billing Ave",
    city: "Lyon",
    country: "France",
    postalCode: "69001",
  }).unwrap();

  const item1 = OrderItem.create({
    id: "item-1",
    productId: "prod-1",
    quantity: 2,
    unitPriceCents: 1000,
  }).unwrap();

  const item2 = OrderItem.create({
    id: "item-2",
    productId: "prod-2",
    quantity: 1,
    unitPriceCents: 2500,
  }).unwrap();

  const createOrder = (overrides?: Record<string, unknown>) =>
    Order.create({
      id: "order-1",
      items: [item1],
      shippingAddress,
      billingAddress,
      ...overrides,
    }).unwrap();

  it("creates a pending order", () => {
    const order = createOrder();
    expect(order.id).toBe("order-1");
    expect(order.status.isPending()).toBe(true);
    expect(order.items).toHaveLength(1);
  });

  it("calculates total cents", () => {
    const order = Order.create({
      id: "order-1",
      items: [item1, item2],
      shippingAddress,
      billingAddress,
    }).unwrap();
    expect(order.totalCents).toBe(4500);
  });

  it("calculates item count", () => {
    const order = Order.create({
      id: "order-1",
      items: [item1, item2],
      shippingAddress,
      billingAddress,
    }).unwrap();
    expect(order.itemCount).toBe(2);
  });

  it("rejects empty id", () => {
    expect(
      Order.create({ id: "", items: [item1], shippingAddress, billingAddress }).isFail(),
    ).toBe(true);
  });

  it("rejects empty items", () => {
    expect(
      Order.create({ id: "order-1", items: [], shippingAddress, billingAddress }).isFail(),
    ).toBe(true);
  });

  it("rejects invalid status string", () => {
    expect(
      Order.create({ id: "order-1", items: [item1], status: "bogus", shippingAddress, billingAddress }).isFail(),
    ).toBe(true);
  });

  describe("state machine transitions", () => {
    it("pending → confirm", () => {
      const order = createOrder();
      const result = order.confirm();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isConfirmed()).toBe(true);
    });

    it("confirmed → process", () => {
      const order = createOrder().confirm().unwrap();
      const result = order.process();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isProcessing()).toBe(true);
    });

    it("processing → ship", () => {
      const order = createOrder().confirm().unwrap().process().unwrap();
      const result = order.ship();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isShipped()).toBe(true);
    });

    it("shipped → deliver", () => {
      const order = createOrder().confirm().unwrap().process().unwrap().ship().unwrap();
      const result = order.deliver();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isDelivered()).toBe(true);
    });

    it("pending → cancel", () => {
      const order = createOrder();
      const result = order.cancel();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isCanceled()).toBe(true);
    });

    it("confirmed → cancel", () => {
      const order = createOrder().confirm().unwrap();
      const result = order.cancel();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isCanceled()).toBe(true);
    });

    it("processing → cancel", () => {
      const order = createOrder().confirm().unwrap().process().unwrap();
      const result = order.cancel();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isCanceled()).toBe(true);
    });
  });

  describe("invalid transitions", () => {
    it("pending cannot ship", () => {
      const result = createOrder().ship();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InvalidOrderTransition");
    });

    it("pending cannot deliver", () => {
      const result = createOrder().deliver();
      expect(result.isFail()).toBe(true);
    });

    it("shipped cannot cancel", () => {
      const order = createOrder().confirm().unwrap().process().unwrap().ship().unwrap();
      const result = order.cancel();
      expect(result.isFail()).toBe(true);
    });

    it("delivered cannot cancel", () => {
      const order = createOrder().confirm().unwrap().process().unwrap().ship().unwrap().deliver().unwrap();
      const result = order.cancel();
      expect(result.isFail()).toBe(true);
    });

    it("canceled cannot confirm", () => {
      const order = createOrder().cancel().unwrap();
      const result = order.confirm();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("OrderAlreadyCanceled");
    });

    it("canceled cannot cancel again", () => {
      const order = createOrder().cancel().unwrap();
      const result = order.cancel();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("OrderAlreadyCanceled");
    });
  });

  describe("immutability", () => {
    it("confirm does not mutate original", () => {
      const order = createOrder();
      order.confirm();
      expect(order.status.isPending()).toBe(true);
    });

    it("cancel does not mutate original", () => {
      const order = createOrder();
      order.cancel();
      expect(order.status.isPending()).toBe(true);
    });
  });
});
