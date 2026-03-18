import type { ICartRepository } from "../application/ports/cart-repository.port.js";
import type { IProductPriceLookup } from "../application/ports/product-price-lookup.port.js";
import { AddToCart } from "../application/use-cases/add-to-cart.use-case.js";
import { RemoveFromCart } from "../application/use-cases/remove-from-cart.use-case.js";
import { UpdateQuantity } from "../application/use-cases/update-quantity.use-case.js";
import { GetCart } from "../application/use-cases/get-cart.use-case.js";
import { ClearCart } from "../application/use-cases/clear-cart.use-case.js";
import { AbandonCart } from "../application/use-cases/abandon-cart.use-case.js";
import { ConvertCart } from "../application/use-cases/convert-cart.use-case.js";
import type { ICartService } from "./cart.contract.js";
import { Result } from "../shared/result.js";

export type CartServiceDeps = {
  cartRepository: ICartRepository;
  productPriceLookup: IProductPriceLookup;
};

export function createCartService(deps: CartServiceDeps): ICartService {
  const addToCart = new AddToCart(deps.cartRepository, deps.productPriceLookup);
  const removeFromCart = new RemoveFromCart(deps.cartRepository);
  const updateQuantity = new UpdateQuantity(deps.cartRepository);
  const getCart = new GetCart(deps.cartRepository);
  const clearCart = new ClearCart(deps.cartRepository);
  const abandonCart = new AbandonCart(deps.cartRepository);
  const convertCart = new ConvertCart(deps.cartRepository);

  return {
    addToCart: (input) =>
      addToCart.execute(input).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    removeFromCart: (input) =>
      removeFromCart.execute(input).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    updateQuantity: (input) => updateQuantity.execute(input),
    getCart: (cartId) => getCart.execute(cartId),
    clearCart: (cartId) => clearCart.execute(cartId),
    abandonCart: (cartId) =>
      abandonCart.execute(cartId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    convertCart: (cartId) =>
      convertCart.execute(cartId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
  };
}
