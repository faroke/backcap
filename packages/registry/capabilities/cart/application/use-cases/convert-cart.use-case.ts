// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { CartNotFound } from "../../domain/errors/cart-not-found.error.js";
import { CartConverted } from "../../domain/events/cart-converted.event.js";
import type { ICartRepository } from "../ports/cart-repository.port.js";

export class ConvertCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(cartId: string): Promise<Result<{ event: CartConverted }, Error>> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      return Result.fail(CartNotFound.create(cartId));
    }

    const convertResult = cart.convert();
    if (convertResult.isFail()) {
      return Result.fail(convertResult.unwrapError());
    }

    await this.cartRepository.update(convertResult.unwrap());

    const event = new CartConverted(cartId);
    return Result.ok({ event });
  }
}
