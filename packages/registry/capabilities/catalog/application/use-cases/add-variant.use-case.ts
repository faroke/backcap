// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { ProductVariant } from "../../domain/entities/product-variant.entity.js";
import { VariantAdded } from "../../domain/events/variant-added.event.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { AddVariantInput } from "../dto/add-variant-input.dto.js";

export class AddVariant {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    input: AddVariantInput,
  ): Promise<Result<{ variantId: string; event: VariantAdded }, Error>> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return Result.fail(ProductNotFound.create(input.productId));
    }

    const variantId = crypto.randomUUID();
    const variantResult = ProductVariant.create({
      id: variantId,
      productId: input.productId,
      sku: input.sku,
      priceCents: input.priceCents,
      currency: input.currency,
      attributes: input.attributes,
    });

    if (variantResult.isFail()) {
      return Result.fail(variantResult.unwrapError());
    }

    const variant = variantResult.unwrap();
    const addResult = product.addVariant(variant);
    if (addResult.isFail()) {
      return Result.fail(addResult.unwrapError());
    }

    await this.productRepository.update(addResult.unwrap());

    const event = new VariantAdded(input.productId, variantId, variant.sku.value);

    return Result.ok({ variantId, event });
  }
}
