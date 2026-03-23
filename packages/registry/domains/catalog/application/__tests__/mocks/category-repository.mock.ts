import type { Category } from "../../../domain/entities/category.entity.js";
import type { ICategoryRepository } from "../../ports/category-repository.port.js";

export class InMemoryCategoryRepository implements ICategoryRepository {
  private store = new Map<string, Category>();

  async findById(id: string): Promise<Category | null> {
    return this.store.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return [...this.store.values()].find((c) => c.slug === slug) ?? null;
  }

  async save(category: Category): Promise<void> {
    this.store.set(category.id, category);
  }

  async findAll(): Promise<Category[]> {
    return [...this.store.values()];
  }
}
