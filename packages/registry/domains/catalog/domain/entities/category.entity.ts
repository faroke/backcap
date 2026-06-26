import { Result } from "../../shared/result.js";
import { InvalidCategoryName } from "../errors/invalid-category-name.error.js";
import { InvalidCategorySlug } from "../errors/invalid-category-slug.error.js";

// Slug: lowercase alphanumeric with hyphens, 2-100 chars
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/;

export class Category {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly parentId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    slug: string,
    parentId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.parentId = parentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null | undefined;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Category, InvalidCategoryName | InvalidCategorySlug> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(InvalidCategoryName.empty());
    }

    if (!SLUG_REGEX.test(params.slug)) {
      return Result.fail(InvalidCategorySlug.invalidFormat(params.slug));
    }

    const now = new Date();
    return Result.ok(
      new Category(
        params.id,
        params.name.trim(),
        params.slug,
        params.parentId ?? null,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }
}
