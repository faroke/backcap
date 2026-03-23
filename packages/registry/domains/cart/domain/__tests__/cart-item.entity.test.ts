import { describe, it, expect } from "vitest";
import { CartItem } from "../entities/cart-item.entity.js";

describe("CartItem entity", () => {
  const validParams = {
    id: "item-1",
    productId: "prod-1",
    variantId: "var-1",
    quantity: 2,
    unitPriceCents: 1999,
  };

  it("creates a valid cart item", () => {
    const result = CartItem.create(validParams);
    expect(result.isOk()).toBe(true);
    const item = result.unwrap();
    expect(item.id).toBe("item-1");
    expect(item.productId).toBe("prod-1");
    expect(item.variantId).toBe("var-1");
    expect(item.quantity.value).toBe(2);
    expect(item.unitPriceCents).toBe(1999);
    expect(item.currency).toBe("USD");
    expect(item.createdAt).toBeInstanceOf(Date);
  });

  it("calculates lineTotal", () => {
    const item = CartItem.create(validParams).unwrap();
    expect(item.lineTotal).toBe(3998);
  });

  it("creates with custom currency", () => {
    const result = CartItem.create({ ...validParams, currency: "EUR" });
    expect(result.unwrap().currency).toBe("EUR");
  });

  it("normalizes currency to uppercase", () => {
    const result = CartItem.create({ ...validParams, currency: "eur" });
    expect(result.unwrap().currency).toBe("EUR");
  });

  it("fails with empty id", () => {
    const result = CartItem.create({ ...validParams, id: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with empty productId", () => {
    const result = CartItem.create({ ...validParams, productId: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with empty variantId", () => {
    const result = CartItem.create({ ...validParams, variantId: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with negative price", () => {
    const result = CartItem.create({ ...validParams, unitPriceCents: -1 });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid quantity", () => {
    const result = CartItem.create({ ...validParams, quantity: 0 });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid currency code", () => {
    const result = CartItem.create({ ...validParams, currency: "FAKE" });
    expect(result.isFail()).toBe(true);
  });

  describe("updateQuantity", () => {
    it("updates quantity", () => {
      const item = CartItem.create(validParams).unwrap();
      const result = item.updateQuantity(5);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().quantity.value).toBe(5);
      expect(result.unwrap().lineTotal).toBe(9995);
    });

    it("preserves immutability", () => {
      const item = CartItem.create(validParams).unwrap();
      item.updateQuantity(5);
      expect(item.quantity.value).toBe(2);
    });

    it("rejects invalid quantity", () => {
      const item = CartItem.create(validParams).unwrap();
      const result = item.updateQuantity(0);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("updatePrice", () => {
    it("updates price and currency", () => {
      const item = CartItem.create(validParams).unwrap();
      const result = item.updatePrice(2999, "USD");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().unitPriceCents).toBe(2999);
    });

    it("rejects invalid price", () => {
      const item = CartItem.create(validParams).unwrap();
      const result = item.updatePrice(-1, "USD");
      expect(result.isFail()).toBe(true);
    });

    it("rejects invalid currency", () => {
      const item = CartItem.create(validParams).unwrap();
      const result = item.updatePrice(1000, "FAKE");
      expect(result.isFail()).toBe(true);
    });
  });
});
