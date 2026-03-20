import { Result } from "../../shared/result.js";
import { Money } from "../../domain/value-objects/money.vo.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { UpdatePriceInput } from "../dto/update-price-input.dto.js";

export class UpdatePrice {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: UpdatePriceInput): Promise<Result<void, Error>> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return Result.fail(ProductNotFound.create(input.productId));
    }

    const priceResult = Money.create(input.priceCents, input.currency ?? product.basePrice.currency);
    if (priceResult.isFail()) {
      return Result.fail(priceResult.unwrapError());
    }

    const updateResult = product.updatePrice(priceResult.unwrap());
    if (updateResult.isFail()) {
      return Result.fail(updateResult.unwrapError());
    }

    await this.productRepository.update(updateResult.unwrap());

    return Result.ok(undefined);
  }
}
