// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { ProductOutput } from "../dto/product-output.dto.js";
import { toProductOutput } from "./mappers.adapter.js";

export class GetProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: string): Promise<Result<ProductOutput, Error>> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return Result.fail(ProductNotFound.create(productId));
    }

    return Result.ok(toProductOutput(product));
  }
}
