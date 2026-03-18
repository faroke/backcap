import { describe, it, expect } from "vitest";
import { CartNotFound } from "../errors/cart-not-found.error.js";
import { ItemNotInCart } from "../errors/item-not-in-cart.error.js";
import { CartLimitExceeded } from "../errors/cart-limit-exceeded.error.js";
import { InvalidQuantity } from "../errors/invalid-quantity.error.js";

describe("Domain errors", () => {
  it("CartNotFound", () => {
    const err = CartNotFound.create("cart-1");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("CartNotFound");
    expect(err.message).toContain("cart-1");
  });

  it("ItemNotInCart", () => {
    const err = ItemNotInCart.create("var-1");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ItemNotInCart");
    expect(err.message).toContain("var-1");
  });

  it("CartLimitExceeded", () => {
    const err = CartLimitExceeded.create(50);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("CartLimitExceeded");
    expect(err.message).toContain("50");
  });

  it("InvalidQuantity", () => {
    const err = InvalidQuantity.create("must be positive");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("InvalidQuantity");
    expect(err.message).toContain("must be positive");
  });
});
