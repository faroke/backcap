import { describe, it, expect, beforeEach } from "vitest";
import { ClearCart } from "../use-cases/clear-cart.use-case.js";
import { AddToCart } from "../use-cases/add-to-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { InMemoryProductPriceLookup } from "./mocks/product-price-lookup.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("ClearCart use case", () => {
  let cartRepo: InMemoryCartRepository;
  let priceLookup: InMemoryProductPriceLookup;
  let clearCart: ClearCart;
  let addToCart: AddToCart;

  beforeEach(async () => {
    cartRepo = new InMemoryCartRepository();
    priceLookup = new InMemoryProductPriceLookup();
    clearCart = new ClearCart(cartRepo);
    addToCart = new AddToCart(cartRepo, priceLookup);

    priceLookup.addPrice({
      productId: "prod-1",
      variantId: "var-1",
      priceCents: 1999,
      currency: "USD",
    });

    const cart = createTestCart();
    await cartRepo.save(cart);
    await addToCart.execute({
      cartId: "test-cart-1",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 2,
    });
  });

  it("clears cart successfully", async () => {
    const result = await clearCart.execute("test-cart-1");

    expect(result.isOk()).toBe(true);

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.itemCount).toBe(0);
    expect(saved!.totalCents).toBe(0);
  });

  it("clears an already-empty cart", async () => {
    const emptyCart = createTestCart({ id: "empty-cart" });
    await cartRepo.save(emptyCart);

    const result = await clearCart.execute("empty-cart");
    expect(result.isOk()).toBe(true);

    const saved = await cartRepo.findById("empty-cart");
    expect(saved!.itemCount).toBe(0);
  });

  it("fails for non-existent cart", async () => {
    const result = await clearCart.execute("no-cart");
    expect(result.isFail()).toBe(true);
  });
});
