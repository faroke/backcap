import { describe, it, expect } from "vitest";
import { CommentContent } from "../value-objects/comment-content.vo.js";

describe("CommentContent VO", () => {
  it("creates valid content", () => {
    const result = CommentContent.create("Hello, world!");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Hello, world!");
  });

  it("trims whitespace", () => {
    const result = CommentContent.create("  Hello  ");
    expect(result.unwrap().value).toBe("Hello");
  });

  it("accepts 1 character", () => {
    const result = CommentContent.create("a");
    expect(result.isOk()).toBe(true);
  });

  it("accepts 10000 characters", () => {
    const result = CommentContent.create("a".repeat(10000));
    expect(result.isOk()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = CommentContent.create("");
    expect(result.isFail()).toBe(true);
  });

  it("rejects whitespace-only string", () => {
    const result = CommentContent.create("   ");
    expect(result.isFail()).toBe(true);
  });

  it("rejects content over 10000 characters", () => {
    const result = CommentContent.create("a".repeat(10001));
    expect(result.isFail()).toBe(true);
  });
});
