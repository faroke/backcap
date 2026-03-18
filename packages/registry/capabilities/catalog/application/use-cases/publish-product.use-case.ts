// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { ProductPublished } from "../../domain/events/product-published.event.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import type { IProductRepository } from "../ports/product-repository.port.js";

export class PublishProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: string): Promise<Result<{ event: ProductPublished }, Error>> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return Result.fail(ProductNotFound.create(productId));
    }

    const publishResult = product.publish();
    if (publishResult.isFail()) {
      return Result.fail(publishResult.unwrapError());
    }

    const published = publishResult.unwrap();
    await this.productRepository.update(published);

    const event = new ProductPublished(published.id);

    return Result.ok({ event });
  }
}
