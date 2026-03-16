import { describe, it, expect } from "vitest";
import { TagSlug } from "../value-objects/tag-slug.vo.js";

describe("TagSlug VO", () => {
  it("creates a valid slug", () => {
    const result = TagSlug.create("my-tag");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("my-tag");
  });

  it("accepts single character", () => {
    const result = TagSlug.create("a");
    expect(result.isOk()).toBe(true);
  });

  it("accepts 64 characters", () => {
    const slug = "a" + "-b".repeat(31) + "c";
    // Just use a simple 64-char valid slug
    const result = TagSlug.create("a".repeat(64));
    expect(result.isOk()).toBe(true);
  });

  it("accepts numbers", () => {
    const result = TagSlug.create("tag123");
    expect(result.isOk()).toBe(true);
  });

  it("rejects uppercase", () => {
    const result = TagSlug.create("My-Tag");
    expect(result.isFail()).toBe(true);
  });

  it("rejects leading hyphen", () => {
    const result = TagSlug.create("-my-tag");
    expect(result.isFail()).toBe(true);
  });

  it("rejects trailing hyphen", () => {
    const result = TagSlug.create("my-tag-");
    expect(result.isFail()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = TagSlug.create("");
    expect(result.isFail()).toBe(true);
  });

  it("rejects over 64 characters", () => {
    const result = TagSlug.create("a".repeat(65));
    expect(result.isFail()).toBe(true);
  });

  it("rejects spaces", () => {
    const result = TagSlug.create("my tag");
    expect(result.isFail()).toBe(true);
  });

  describe("fromName", () => {
    it("converts name to slug", () => {
      const result = TagSlug.fromName("My Cool Tag");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe("my-cool-tag");
    });

    it("handles special characters", () => {
      const result = TagSlug.fromName("C++ Programming!");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe("c-programming");
    });

    it("trims whitespace", () => {
      const result = TagSlug.fromName("  hello  ");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe("hello");
    });

    it("rejects empty name", () => {
      const result = TagSlug.fromName("   ");
      expect(result.isFail()).toBe(true);
    });

    it("rejects name with only special characters", () => {
      const result = TagSlug.fromName("!@#$%");
      expect(result.isFail()).toBe(true);
    });
  });
});
