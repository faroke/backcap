import { Result } from "../../shared/result.js";
import { Product } from "../../domain/entities/product.entity.js";
import { ProductCreated } from "../../domain/events/product-created.event.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { CreateProductInput } from "../dto/create-product-input.dto.js";
import type { InvalidProductName } from "../../domain/errors/invalid-product-name.error.js";
import type { InvalidProductDescription } from "../../domain/errors/invalid-product-description.error.js";
import type { MoneyError } from "../../domain/errors/money.error.js";
import type { InvalidProductStatus } from "../../domain/errors/invalid-product-status.error.js";

export class CreateProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    input: CreateProductInput,
  ): Promise<
    Result<
      { productId: string; event: ProductCreated },
      InvalidProductName | InvalidProductDescription | MoneyError | InvalidProductStatus
    >
  > {
    const id = crypto.randomUUID();
    const productResult = Product.create({
      id,
      name: input.name,
      description: input.description,
      basePriceCents: input.basePriceCents,
      currency: input.currency,
      categoryId: input.categoryId,
    });

    if (productResult.isFail()) {
      return Result.fail(productResult.unwrapError());
    }

    const product = productResult.unwrap();
    await this.productRepository.save(product);

    const event = new ProductCreated(product.id, product.name);

    return Result.ok({ productId: product.id, event });
  }
}
