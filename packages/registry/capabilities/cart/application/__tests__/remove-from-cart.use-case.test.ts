import { describe, it, expect, beforeEach } from "vitest";
import { RemoveFromCart } from "../use-cases/remove-from-cart.use-case.js";
import { AddToCart } from "../use-cases/add-to-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { InMemoryProductPriceLookup } from "./mocks/product-price-lookup.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("RemoveFromCart use case", () => {
  let cartRepo: InMemoryCartRepository;
  let priceLookup: InMemoryProductPriceLookup;
  let removeFromCart: RemoveFromCart;
  let addToCart: AddToCart;

  beforeEach(async () => {
    cartRepo = new InMemoryCartRepository();
    priceLookup = new InMemoryProductPriceLookup();
    removeFromCart = new RemoveFromCart(cartRepo);
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

  it("removes item from cart", async () => {
    const result = await removeFromCart.execute({
      cartId: "test-cart-1",
      variantId: "var-1",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.cartId).toBe("test-cart-1");

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.itemCount).toBe(0);
  });

  it("fails for non-existent cart", async () => {
    const result = await removeFromCart.execute({
      cartId: "no-cart",
      variantId: "var-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CartNotFound");
  });

  it("fails for non-existent item", async () => {
    const result = await removeFromCart.execute({
      cartId: "test-cart-1",
      variantId: "var-999",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ItemNotInCart");
  });
});
