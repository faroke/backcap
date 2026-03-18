import type { Product } from "../../domain/entities/product.entity.js";

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  findAll(): Promise<Product[]>;
  findByCategoryId(categoryId: string): Promise<Product[]>;
}
