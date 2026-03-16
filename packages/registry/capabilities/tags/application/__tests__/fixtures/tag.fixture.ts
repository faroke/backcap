import { Tag } from "../../../domain/entities/tag.entity.js";

export function createTestTag(
  overrides?: Partial<{
    id: string;
    name: string;
    slug: string;
  }>,
): Tag {
  const result = Tag.create({
    id: overrides?.id ?? "test-tag-1",
    name: overrides?.name ?? "TypeScript",
    slug: overrides?.slug ?? "typescript",
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test tag: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
