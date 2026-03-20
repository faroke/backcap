import { Result } from "../../shared/result.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { ICategoryRepository } from "../ports/category-repository.port.js";
import type { ProductOutput } from "../dto/product-output.dto.js";
import { toProductOutput } from "./mappers.adapter.js";

export class ListByCategory {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(categoryId: string): Promise<Result<ProductOutput[], Error>> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      return Result.fail(new Error(`Category not found: "${categoryId}"`));
    }

    const products = await this.productRepository.findByCategoryId(categoryId);
    return Result.ok(products.map(toProductOutput));
  }
}
