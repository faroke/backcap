import { describe, it, expect } from "vitest";
import { Tag } from "../entities/tag.entity.js";

describe("Tag entity", () => {
  const validParams = {
    id: "tag-1",
    name: "TypeScript",
    slug: "typescript",
  };

  it("creates a valid tag", () => {
    const result = Tag.create(validParams);
    expect(result.isOk()).toBe(true);
    const tag = result.unwrap();
    expect(tag.id).toBe("tag-1");
    expect(tag.name).toBe("TypeScript");
    expect(tag.slug.value).toBe("typescript");
    expect(tag.createdAt).toBeInstanceOf(Date);
  });

  it("creates tag with custom createdAt", () => {
    const date = new Date("2025-01-01T00:00:00Z");
    const result = Tag.create({ ...validParams, createdAt: date });
    expect(result.unwrap().createdAt).toBe(date);
  });

  it("fails with invalid slug", () => {
    const result = Tag.create({ ...validParams, slug: "INVALID" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with leading hyphen slug", () => {
    const result = Tag.create({ ...validParams, slug: "-bad" });
    expect(result.isFail()).toBe(true);
  });
});
