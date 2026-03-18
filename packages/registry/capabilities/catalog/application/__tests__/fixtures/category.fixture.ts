import { Category } from "../../../domain/entities/category.entity.js";

export function createTestCategory(
  overrides?: Partial<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>,
): Category {
  const result = Category.create({
    id: overrides?.id ?? "test-cat-1",
    name: overrides?.name ?? "Test Category",
    slug: overrides?.slug ?? "test-category",
    parentId: overrides?.parentId ?? null,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test category: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
