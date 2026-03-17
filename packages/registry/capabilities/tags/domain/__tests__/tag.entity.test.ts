import { describe, it, expect } from "vitest";
import { Tag } from "../entities/tag.entity.js";
import { InvalidTagSlug } from "../errors/invalid-tag-slug.error.js";

describe("Tag entity", () => {
  it("creates a tag with auto-generated slug", () => {
    const result = Tag.create({ id: "tag-1", name: "Web Development" });
    expect(result.isOk()).toBe(true);
    const tag = result.unwrap();
    expect(tag.id).toBe("tag-1");
    expect(tag.name).toBe("Web Development");
    expect(tag.slug.value).toBe("web-development");
    expect(tag.createdAt).toBeInstanceOf(Date);
  });

  it("creates a tag with explicit slug", () => {
    const result = Tag.create({ id: "tag-1", name: "JS", slug: "javascript" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().slug.value).toBe("javascript");
  });

  it("fails with invalid explicit slug", () => {
    const result = Tag.create({ id: "tag-1", name: "Bad", slug: "Bad Slug" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTagSlug);
  });
});
