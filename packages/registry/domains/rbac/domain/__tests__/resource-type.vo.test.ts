import { describe, it, expect } from "vitest";
import { ResourceType } from "../value-objects/resource-type.vo.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";

describe("ResourceType VO", () => {
  it("creates valid resource type", () => {
    const result = ResourceType.create("posts");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("posts");
  });

  it("normalizes to lowercase", () => {
    const result = ResourceType.create("Posts");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("posts");
  });

  it("trims whitespace", () => {
    const result = ResourceType.create("  posts  ");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("posts");
  });

  it("allows hyphens and numbers", () => {
    const result = ResourceType.create("blog-posts-2");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("blog-posts-2");
  });

  it("fails with empty string", () => {
    const result = ResourceType.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("fails with whitespace only", () => {
    const result = ResourceType.create("   ");
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid characters", () => {
    const result = ResourceType.create("posts_v2");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("fails with trailing hyphen", () => {
    const result = ResourceType.create("posts-");
    expect(result.isFail()).toBe(true);
  });

  it("fails with leading hyphen", () => {
    const result = ResourceType.create("-posts");
    expect(result.isFail()).toBe(true);
  });

  it("fails starting with number", () => {
    const result = ResourceType.create("2posts");
    expect(result.isFail()).toBe(true);
  });

  it("equals compares values", () => {
    const a = ResourceType.create("posts").unwrap();
    const b = ResourceType.create("posts").unwrap();
    const c = ResourceType.create("users").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
