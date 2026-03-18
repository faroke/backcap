import { describe, it, expect, beforeEach } from "vitest";
import { AddToCart } from "../use-cases/add-to-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { InMemoryProductPriceLookup } from "./mocks/product-price-lookup.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("AddToCart use case", () => {
  let cartRepo: InMemoryCartRepository;
  let priceLookup: InMemoryProductPriceLookup;
  let addToCart: AddToCart;

  beforeEach(() => {
    cartRepo = new InMemoryCartRepository();
    priceLookup = new InMemoryProductPriceLookup();
    addToCart = new AddToCart(cartRepo, priceLookup);

    priceLookup.addPrice({
      productId: "prod-1",
      variantId: "var-1",
      priceCents: 1999,
      currency: "USD",
    });
  });

  it("adds item to cart successfully", async () => {
    const cart = createTestCart();
    await cartRepo.save(cart);

    const result = await addToCart.execute({
      cartId: "test-cart-1",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 2,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.cartId).toBe("test-cart-1");
    expect(result.unwrap().event.variantId).toBe("var-1");

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.itemCount).toBe(1);
    expect(saved!.items[0].unitPriceCents).toBe(1999);
  });

  it("fails for non-existent cart", async () => {
    const result = await addToCart.execute({
      cartId: "no-cart",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 1,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CartNotFound");
  });

  it("fails for non-existent product/variant", async () => {
    const cart = createTestCart();
    await cartRepo.save(cart);

    const result = await addToCart.execute({
      cartId: "test-cart-1",
      productId: "prod-999",
      variantId: "var-999",
      quantity: 1,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("not found");
  });

  it("updates quantity when adding same variant", async () => {
    const cart = createTestCart();
    await cartRepo.save(cart);

    await addToCart.execute({
      cartId: "test-cart-1",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 2,
    });

    await addToCart.execute({
      cartId: "test-cart-1",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 3,
    });

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.itemCount).toBe(1);
    expect(saved!.items[0].quantity.value).toBe(5);
  });
});
