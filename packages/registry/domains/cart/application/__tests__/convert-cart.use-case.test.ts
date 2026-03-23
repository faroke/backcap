import { describe, it, expect, beforeEach } from "vitest";
import { ConvertCart } from "../use-cases/convert-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("ConvertCart use case", () => {
  let cartRepo: InMemoryCartRepository;
  let convertCart: ConvertCart;

  beforeEach(() => {
    cartRepo = new InMemoryCartRepository();
    convertCart = new ConvertCart(cartRepo);
  });

  it("converts an active cart", async () => {
    const cart = createTestCart();
    await cartRepo.save(cart);

    const result = await convertCart.execute("test-cart-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.cartId).toBe("test-cart-1");

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.status.isConverted()).toBe(true);
  });

  it("fails for non-existent cart", async () => {
    const result = await convertCart.execute("no-cart");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CartNotFound");
  });

  it("fails for already converted cart", async () => {
    const cart = createTestCart({ status: "converted" });
    await cartRepo.save(cart);

    const result = await convertCart.execute("test-cart-1");
    expect(result.isFail()).toBe(true);
  });
});
