import { describe, it, expect, beforeEach } from "vitest";
import { UpdateQuantity } from "../use-cases/update-quantity.use-case.js";
import { AddToCart } from "../use-cases/add-to-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { InMemoryProductPriceLookup } from "./mocks/product-price-lookup.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("UpdateQuantity use case", () => {
  let cartRepo: InMemoryCartRepository;
  let priceLookup: InMemoryProductPriceLookup;
  let updateQuantity: UpdateQuantity;
  let addToCart: AddToCart;

  beforeEach(async () => {
    cartRepo = new InMemoryCartRepository();
    priceLookup = new InMemoryProductPriceLookup();
    updateQuantity = new UpdateQuantity(cartRepo);
    addToCart = new AddToCart(cartRepo, priceLookup);

    priceLookup.addPrice({
      productId: "prod-1",
      variantId: "var-1",
      priceCents: 1000,
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

  it("updates quantity successfully", async () => {
    const result = await updateQuantity.execute({
      cartId: "test-cart-1",
      variantId: "var-1",
      quantity: 5,
    });

    expect(result.isOk()).toBe(true);

    const saved = await cartRepo.findById("test-cart-1");
    expect(saved!.items[0].quantity.value).toBe(5);
  });

  it("fails for non-existent cart", async () => {
    const result = await updateQuantity.execute({
      cartId: "no-cart",
      variantId: "var-1",
      quantity: 5,
    });

    expect(result.isFail()).toBe(true);
  });

  it("fails for non-existent item", async () => {
    const result = await updateQuantity.execute({
      cartId: "test-cart-1",
      variantId: "var-999",
      quantity: 5,
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid quantity", async () => {
    const result = await updateQuantity.execute({
      cartId: "test-cart-1",
      variantId: "var-1",
      quantity: 0,
    });

    expect(result.isFail()).toBe(true);
  });
});
