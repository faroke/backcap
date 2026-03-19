// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { IProductRepository } from "../ports/product-repository.port.js";
import type { ProductOutput } from "../dto/product-output.dto.js";
import { toProductOutput } from "./mappers.adapter.js";

export class ListProducts {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<Result<ProductOutput[], Error>> {
    const products = await this.productRepository.findAll();
    return Result.ok(products.map(toProductOutput));
  }
}
