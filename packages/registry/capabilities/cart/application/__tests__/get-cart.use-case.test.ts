import { describe, it, expect, beforeEach } from "vitest";
import { GetCart } from "../use-cases/get-cart.use-case.js";
import { AddToCart } from "../use-cases/add-to-cart.use-case.js";
import { InMemoryCartRepository } from "./mocks/cart-repository.mock.js";
import { InMemoryProductPriceLookup } from "./mocks/product-price-lookup.mock.js";
import { createTestCart } from "./fixtures/cart.fixture.js";

describe("GetCart use case", () => {
  let cartRepo: InMemoryCartRepository;
  let priceLookup: InMemoryProductPriceLookup;
  let getCart: GetCart;
  let addToCart: AddToCart;

  beforeEach(async () => {
    cartRepo = new InMemoryCartRepository();
    priceLookup = new InMemoryProductPriceLookup();
    getCart = new GetCart(cartRepo);
    addToCart = new AddToCart(cartRepo, priceLookup);

    priceLookup.addPrice({
      productId: "prod-1",
      variantId: "var-1",
      priceCents: 1999,
      currency: "USD",
    });

    const cart = createTestCart({ userId: "user-1" });
    await cartRepo.save(cart);
    await addToCart.execute({
      cartId: "test-cart-1",
      productId: "prod-1",
      variantId: "var-1",
      quantity: 2,
    });
  });

  it("returns cart output", async () => {
    const result = await getCart.execute("test-cart-1");

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.id).toBe("test-cart-1");
    expect(output.userId).toBe("user-1");
    expect(output.status).toBe("active");
    expect(output.itemCount).toBe(1);
    expect(output.totalCents).toBe(3998);
    expect(output.items[0].variantId).toBe("var-1");
    expect(output.items[0].lineTotal).toBe(3998);
  });

  it("fails for non-existent cart", async () => {
    const result = await getCart.execute("no-cart");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CartNotFound");
  });
});
