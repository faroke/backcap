import { describe, it, expect } from "vitest";
import { Cart } from "../entities/cart.entity.js";
import { CartLimitExceeded } from "../errors/cart-limit-exceeded.error.js";
import { ItemNotInCart } from "../errors/item-not-in-cart.error.js";

describe("Cart entity", () => {
  const createCart = (overrides?: Record<string, unknown>) =>
    Cart.create({ id: "cart-1", ...overrides }).unwrap();

  const itemParams = {
    id: "item-1",
    productId: "prod-1",
    variantId: "var-1",
    quantity: 2,
    unitPriceCents: 1000,
  };

  it("creates an active cart", () => {
    const cart = createCart();
    expect(cart.id).toBe("cart-1");
    expect(cart.status.isActive()).toBe(true);
    expect(cart.items).toEqual([]);
    expect(cart.totalCents).toBe(0);
    expect(cart.itemCount).toBe(0);
    expect(cart.currency).toBe("USD");
  });

  it("creates cart with userId", () => {
    const cart = createCart({ userId: "user-1" });
    expect(cart.userId).toBe("user-1");
  });

  it("creates cart with custom currency", () => {
    const cart = createCart({ currency: "EUR" });
    expect(cart.currency).toBe("EUR");
  });

  it("creates cart with custom status", () => {
    const result = Cart.create({ id: "cart-1", status: "abandoned" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status.isAbandoned()).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = Cart.create({ id: "cart-1", status: "invalid" });
    expect(result.isFail()).toBe(true);
  });

  it("rejects empty id", () => {
    const result = Cart.create({ id: "" });
    expect(result.isFail()).toBe(true);
  });

  it("rejects zero maxItems", () => {
    const result = Cart.create({ id: "cart-1", maxItems: 0 });
    expect(result.isFail()).toBe(true);
  });

  it("rejects negative maxItems", () => {
    const result = Cart.create({ id: "cart-1", maxItems: -1 });
    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid currency", () => {
    const result = Cart.create({ id: "cart-1", currency: "FAKE" });
    expect(result.isFail()).toBe(true);
  });

  describe("addItem", () => {
    it("adds a new item", () => {
      const cart = createCart();
      const result = cart.addItem(itemParams);
      expect(result.isOk()).toBe(true);
      const updated = result.unwrap();
      expect(updated.itemCount).toBe(1);
      expect(updated.totalCents).toBe(2000);
    });

    it("updates quantity and price for existing variant", () => {
      const cart = createCart();
      const withItem = cart.addItem(itemParams).unwrap();
      const result = withItem.addItem({ ...itemParams, id: "item-2", quantity: 3, unitPriceCents: 1500 });
      expect(result.isOk()).toBe(true);
      const updated = result.unwrap();
      expect(updated.itemCount).toBe(1);
      expect(updated.items[0].quantity.value).toBe(5);
      expect(updated.items[0].unitPriceCents).toBe(1500);
      expect(updated.totalCents).toBe(7500);
    });

    it("rejects when cart is at max items", () => {
      const cart = createCart({ maxItems: 1 });
      const withItem = cart.addItem(itemParams).unwrap();
      const result = withItem.addItem({
        ...itemParams,
        id: "item-2",
        variantId: "var-2",
      });
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(CartLimitExceeded);
    });

    it("rejects when cart is not active", () => {
      const cart = createCart();
      const abandoned = cart.abandon().unwrap();
      const result = abandoned.addItem(itemParams);
      expect(result.isFail()).toBe(true);
    });

    it("rejects item with different currency", () => {
      const cart = createCart({ currency: "USD" });
      const result = cart.addItem({ ...itemParams, currency: "EUR" });
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().message).toContain("Currency mismatch");
    });

    it("recalculates total after add", () => {
      const cart = createCart();
      const item1 = { ...itemParams, variantId: "var-1", unitPriceCents: 1000, quantity: 1 };
      const item2 = { ...itemParams, id: "item-2", variantId: "var-2", unitPriceCents: 2000, quantity: 3 };
      const updated = cart.addItem(item1).unwrap().addItem(item2).unwrap();
      expect(updated.totalCents).toBe(7000);
    });
  });

  describe("removeItem", () => {
    it("removes an existing item", () => {
      const cart = createCart();
      const withItem = cart.addItem(itemParams).unwrap();
      const result = withItem.removeItem("var-1");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().itemCount).toBe(0);
    });

    it("fails for non-existent variant", () => {
      const cart = createCart();
      const result = cart.removeItem("var-999");
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(ItemNotInCart);
    });

    it("fails on non-active cart with descriptive error", () => {
      const cart = createCart();
      const withItem = cart.addItem(itemParams).unwrap();
      const abandoned = withItem.abandon().unwrap();
      const result = abandoned.removeItem("var-1");
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().message).toContain("non-active");
    });
  });

  describe("updateItemQuantity", () => {
    it("updates item quantity", () => {
      const cart = createCart();
      const withItem = cart.addItem(itemParams).unwrap();
      const result = withItem.updateItemQuantity("var-1", 5);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().items[0].quantity.value).toBe(5);
      expect(result.unwrap().totalCents).toBe(5000);
    });

    it("fails for non-existent variant", () => {
      const cart = createCart();
      const result = cart.updateItemQuantity("var-999", 5);
      expect(result.isFail()).toBe(true);
    });

    it("fails with invalid quantity", () => {
      const cart = createCart();
      const withItem = cart.addItem(itemParams).unwrap();
      const result = withItem.updateItemQuantity("var-1", 0);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all items", () => {
      const cart = createCart();
      const withItems = cart
        .addItem(itemParams)
        .unwrap()
        .addItem({ ...itemParams, id: "item-2", variantId: "var-2" })
        .unwrap();
      const result = withItems.clear();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().itemCount).toBe(0);
      expect(result.unwrap().totalCents).toBe(0);
    });

    it("fails on non-active cart", () => {
      const cart = createCart().abandon().unwrap();
      expect(cart.clear().isFail()).toBe(true);
    });
  });

  describe("abandon", () => {
    it("abandons an active cart", () => {
      const cart = createCart();
      const result = cart.abandon();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isAbandoned()).toBe(true);
    });

    it("fails on non-active cart", () => {
      const cart = createCart().abandon().unwrap();
      expect(cart.abandon().isFail()).toBe(true);
    });
  });

  describe("convert", () => {
    it("converts an active cart", () => {
      const cart = createCart();
      const result = cart.convert();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isConverted()).toBe(true);
    });

    it("fails on non-active cart", () => {
      const cart = createCart().convert().unwrap();
      expect(cart.convert().isFail()).toBe(true);
    });
  });

  describe("immutability", () => {
    it("addItem does not mutate original", () => {
      const cart = createCart();
      cart.addItem(itemParams);
      expect(cart.itemCount).toBe(0);
    });

    it("removeItem does not mutate original", () => {
      const cart = createCart();
      const withItem = cart.addItem(itemParams).unwrap();
      withItem.removeItem("var-1");
      expect(withItem.itemCount).toBe(1);
    });
  });
});
