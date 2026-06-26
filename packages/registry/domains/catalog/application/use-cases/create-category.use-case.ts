import { Result } from "../../shared/result.js";
import { Category } from "../../domain/entities/category.entity.js";
import { DuplicateCategorySlug } from "../../domain/errors/duplicate-category-slug.error.js";
import type { InvalidCategoryName } from "../../domain/errors/invalid-category-name.error.js";
import type { InvalidCategorySlug } from "../../domain/errors/invalid-category-slug.error.js";
import type { ICategoryRepository } from "../ports/category-repository.port.js";
import type { CreateCategoryInput } from "../dto/create-category-input.dto.js";

export class CreateCategory {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    input: CreateCategoryInput,
  ): Promise<
    Result<
      { categoryId: string },
      DuplicateCategorySlug | InvalidCategoryName | InvalidCategorySlug
    >
  > {
    const existing = await this.categoryRepository.findBySlug(input.slug);
    if (existing) {
      return Result.fail(DuplicateCategorySlug.create(input.slug));
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
