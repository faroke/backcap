import { describe, it, expect } from "vitest";
import { OrderItem } from "../entities/order-item.entity.js";

describe("OrderItem entity", () => {
  const validParams = {
    id: "item-1",
    productId: "prod-1",
    quantity: 2,
    unitPriceCents: 1500,
  };

  it("creates a valid order item", () => {
    const result = OrderItem.create(validParams);
    expect(result.isOk()).toBe(true);
    const item = result.unwrap();
    expect(item.id).toBe("item-1");
    expect(item.productId).toBe("prod-1");
    expect(item.quantity).toBe(2);
    expect(item.unitPriceCents).toBe(1500);
  });

  it("calculates line total", () => {
    const item = OrderItem.create(validParams).unwrap();
    expect(item.lineTotal).toBe(3000);
  });

  it("rejects empty id", () => {
    expect(OrderItem.create({ ...validParams, id: "" }).isFail()).toBe(true);
  });

  it("rejects empty product id", () => {
    expect(OrderItem.create({ ...validParams, productId: "" }).isFail()).toBe(true);
  });

  it("rejects zero quantity", () => {
    expect(OrderItem.create({ ...validParams, quantity: 0 }).isFail()).toBe(true);
  });

  it("rejects negative quantity", () => {
    expect(OrderItem.create({ ...validParams, quantity: -1 }).isFail()).toBe(true);
  });

  it("rejects non-integer quantity", () => {
    expect(OrderItem.create({ ...validParams, quantity: 1.5 }).isFail()).toBe(true);
  });

  it("rejects negative price", () => {
    expect(OrderItem.create({ ...validParams, unitPriceCents: -100 }).isFail()).toBe(true);
  });

  it("allows zero price", () => {
    expect(OrderItem.create({ ...validParams, unitPriceCents: 0 }).isOk()).toBe(true);
  });
});
