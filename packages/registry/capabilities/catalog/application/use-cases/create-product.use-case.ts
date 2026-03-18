// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Product } from "../../domain/entities/product.entity.js";
import { ProductCreated } from "../../domain/events/product-created.event.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { CreateProductInput } from "../dto/create-product-input.dto.js";

export class CreateProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    input: CreateProductInput,
  ): Promise<Result<{ productId: string; event: ProductCreated }, Error>> {
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
