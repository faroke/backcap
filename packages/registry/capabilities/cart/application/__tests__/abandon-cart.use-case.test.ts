import { describe, it, expect, beforeEach } from "vitest";
import { AbandonCart } from "../use-cases/abandon-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("AbandonCart use case", () => {
  let cartRepo: InMemoryCartRepository;
  let abandonCart: AbandonCart;

  beforeEach(() => {
    cartRepo = new InMemoryCartRepository();
    abandonCart = new AbandonCart(cartRepo);
  });

  it("abandons an active cart", async () => {
    const cart = createTestCart();
    await cartRepo.save(cart);

    const result = await abandonCart.execute("test-cart-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.cartId).toBe("test-cart-1");

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.status.isAbandoned()).toBe(true);
  });

  it("fails for non-existent cart", async () => {
    const result = await abandonCart.execute("no-cart");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CartNotFound");
  });

  it("fails for already abandoned cart", async () => {
    const cart = createTestCart({ status: "abandoned" });
    await cartRepo.save(cart);

    const result = await abandonCart.execute("test-cart-1");
    expect(result.isFail()).toBe(true);
  });
});
