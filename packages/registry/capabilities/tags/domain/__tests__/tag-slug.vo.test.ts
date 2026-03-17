import { describe, it, expect } from "vitest";
import { TagSlug } from "../value-objects/tag-slug.vo.js";
import { InvalidTagSlug } from "../errors/invalid-tag-slug.error.js";

describe("TagSlug VO", () => {
  it("creates a valid slug", () => {
    const result = TagSlug.create("javascript");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("javascript");
  });

  it("accepts kebab-case with numbers", () => {
    const result = TagSlug.create("web-dev-2024");
    expect(result.isOk()).toBe(true);
  });

  it("rejects uppercase", () => {
    const result = TagSlug.create("JavaScript");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTagSlug);
  });

  it("rejects leading hyphens", () => {
    expect(TagSlug.create("-javascript").isFail()).toBe(true);
  });

  it("rejects trailing hyphens", () => {
    expect(TagSlug.create("javascript-").isFail()).toBe(true);
  });

  it("rejects empty string", () => {
    expect(TagSlug.create("").isFail()).toBe(true);
  });

  it("rejects strings longer than 64 characters", () => {
    expect(TagSlug.create("a".repeat(65)).isFail()).toBe(true);
  });

  it("fromName generates a slug from a tag name", () => {
    const result = TagSlug.fromName("Web Development");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("web-development");
  });

  it("fromName strips special characters", () => {
    const result = TagSlug.fromName("C++ Programming!");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("c-programming");
  });

  it("fromName collapses spaces", () => {
    const result = TagSlug.fromName("Hello   World");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("hello-world");
  });
});
