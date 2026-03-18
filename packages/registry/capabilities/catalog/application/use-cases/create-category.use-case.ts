// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Category } from "../../domain/entities/category.entity.js";
import type { ICategoryRepository } from "../ports/category-repository.port.js";
import type { CreateCategoryInput } from "../dto/create-category-input.dto.js";

export class CreateCategory {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    input: CreateCategoryInput,
  ): Promise<Result<{ categoryId: string }, Error>> {
    const existing = await this.categoryRepository.findBySlug(input.slug);
    if (existing) {
      return Result.fail(new Error(`Category with slug "${input.slug}" already exists`));
    }

    const id = crypto.randomUUID();
    const categoryResult = Category.create({
      id,
      name: input.name,
      slug: input.slug,
      parentId: input.parentId,
    });

    if (categoryResult.isFail()) {
      return Result.fail(categoryResult.unwrapError());
    }

    await this.categoryRepository.save(categoryResult.unwrap());

    return Result.ok({ categoryId: id });
  }
}
