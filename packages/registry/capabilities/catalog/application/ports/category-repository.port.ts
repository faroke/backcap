import type { Category } from "../../domain/entities/category.entity.js";

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  save(category: Category): Promise<void>;
  findAll(): Promise<Category[]>;
}
