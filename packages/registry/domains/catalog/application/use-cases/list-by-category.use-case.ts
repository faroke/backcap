import { Result } from "../../shared/result.js";
import { CategoryNotFound } from "../../domain/errors/category-not-found.error.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { ICategoryRepository } from "../ports/category-repository.port.js";
import type { ProductOutput } from "../dto/product-output.dto.js";
import { toProductOutput } from "./mappers.adapter.js";

export class ListByCategory {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(categoryId: string): Promise<Result<ProductOutput[], CategoryNotFound>> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      return Result.fail(CategoryNotFound.create(categoryId));
    }

    const products = await this.productRepository.findByCategoryId(categoryId);
    return Result.ok(products.map(toProductOutput));
  }
}
