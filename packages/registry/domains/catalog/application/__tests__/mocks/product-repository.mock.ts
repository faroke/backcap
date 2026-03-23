import type { Product } from "../../../domain/entities/product.entity.js";
import type { IProductRepository } from "../../ports/product-repository.port.js";

export class InMemoryProductRepository implements IProductRepository {
  private store = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  async save(product: Product): Promise<void> {
    this.store.set(product.id, product);
  }

  async update(product: Product): Promise<void> {
    this.store.set(product.id, product);
  }

  async findAll(): Promise<Product[]> {
    return [...this.store.values()];
  }

  async findByCategoryId(categoryId: string): Promise<Product[]> {
    return [...this.store.values()].filter((p) => p.categoryId === categoryId);
  }
}
