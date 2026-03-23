import { describe, it, expect } from "vitest";
import { ItemAddedToCart } from "../events/item-added-to-cart.event.js";
import { ItemRemovedFromCart } from "../events/item-removed-from-cart.event.js";
import { CartAbandoned } from "../events/cart-abandoned.event.js";
import { CartConverted } from "../events/cart-converted.event.js";

describe("Domain events", () => {
  it("ItemAddedToCart", () => {
    const event = new ItemAddedToCart("cart-1", "var-1", 3);
    expect(event.cartId).toBe("cart-1");
    expect(event.variantId).toBe("var-1");
    expect(event.quantity).toBe(3);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("ItemRemovedFromCart", () => {
    const event = new ItemRemovedFromCart("cart-1", "var-1");
    expect(event.cartId).toBe("cart-1");
    expect(event.variantId).toBe("var-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("CartAbandoned", () => {
    const event = new CartAbandoned("cart-1");
    expect(event.cartId).toBe("cart-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("CartConverted", () => {
    const event = new CartConverted("cart-1");
    expect(event.cartId).toBe("cart-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });
});
