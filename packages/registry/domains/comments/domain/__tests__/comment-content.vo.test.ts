import { describe, it, expect } from "vitest";
import { CommentContent } from "../value-objects/comment-content.vo.js";

describe("CommentContent VO", () => {
  it("creates valid content", () => {
    const result = CommentContent.create("Hello world");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Hello world");
  });

  it("trims whitespace", () => {
    const result = CommentContent.create("  Hello  ");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Hello");
  });

  it("rejects empty content", () => {
    const result = CommentContent.create("");
    expect(result.isFail()).toBe(true);
  });

  it("rejects whitespace-only content", () => {
    const result = CommentContent.create("   ");
    expect(result.isFail()).toBe(true);
  });

  it("rejects content longer than 10000 characters", () => {
    const result = CommentContent.create("a".repeat(10001));
    expect(result.isFail()).toBe(true);
  });

  it("accepts content at exactly 10000 characters", () => {
    const result = CommentContent.create("a".repeat(10000));
    expect(result.isOk()).toBe(true);
  });
});
