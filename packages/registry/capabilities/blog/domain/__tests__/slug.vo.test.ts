import { describe, it, expect } from "vitest";
import { Slug } from "../value-objects/slug.vo.js";
import { InvalidSlug } from "../errors/invalid-slug.error.js";

describe("Slug VO", () => {
  it("creates a valid kebab-case slug", () => {
    const result = Slug.create("hello-world");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("hello-world");
  });

  it("accepts a single lowercase word", () => {
    const result = Slug.create("typescript");
    expect(result.isOk()).toBe(true);
  });

  it("accepts slugs with numbers", () => {
    const result = Slug.create("post-2024");
    expect(result.isOk()).toBe(true);
  });

  it("rejects uppercase letters", () => {
    const result = Slug.create("Hello-World");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidSlug);
  });

  it("rejects slugs with spaces", () => {
    const result = Slug.create("hello world");
    expect(result.isFail()).toBe(true);
  });

  it("rejects slugs with leading hyphens", () => {
    const result = Slug.create("-hello-world");
    expect(result.isFail()).toBe(true);
  });

  it("rejects slugs with trailing hyphens", () => {
    const result = Slug.create("hello-world-");
    expect(result.isFail()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = Slug.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidSlug);
  });

  it("fromTitle generates a valid slug from a title", () => {
    const result = Slug.fromTitle("Hello World My Post");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("hello-world-my-post");
  });

  it("fromTitle strips special characters", () => {
    const result = Slug.fromTitle("My Awesome Post!");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("my-awesome-post");
  });

  it("fromTitle collapses multiple spaces into single hyphen", () => {
    const result = Slug.fromTitle("Hello   World");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("hello-world");
  });

  it("is immutable (readonly value)", () => {
    const slug = Slug.create("my-slug").unwrap();
    expect(slug.value).toBe("my-slug");
  });
});
