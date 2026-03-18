import { describe, it, expect } from "vitest";
import { OrgSlug } from "../value-objects/org-slug.vo.js";

describe("OrgSlug VO", () => {
  it("creates a valid slug", () => {
    const result = OrgSlug.create("my-org");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("my-org");
  });

  it("normalizes to lowercase", () => {
    const result = OrgSlug.create("My-Org");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("my-org");
  });

  it("accepts alphanumeric slug", () => {
    const result = OrgSlug.create("org123");
    expect(result.isOk()).toBe(true);
  });

  it("accepts minimum length slug (3 chars)", () => {
    const result = OrgSlug.create("abc");
    expect(result.isOk()).toBe(true);
  });

  it("rejects slug shorter than 3 chars", () => {
    const result = OrgSlug.create("ab");
    expect(result.isFail()).toBe(true);
  });

  it("rejects single character slug", () => {
    const result = OrgSlug.create("a");
    expect(result.isFail()).toBe(true);
  });

  it("rejects slug starting with hyphen", () => {
    const result = OrgSlug.create("-my-org");
    expect(result.isFail()).toBe(true);
  });

  it("rejects slug ending with hyphen", () => {
    const result = OrgSlug.create("my-org-");
    expect(result.isFail()).toBe(true);
  });

  it("rejects slug with spaces", () => {
    const result = OrgSlug.create("my org");
    expect(result.isFail()).toBe(true);
  });

  it("rejects slug with special characters", () => {
    const result = OrgSlug.create("my_org!");
    expect(result.isFail()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = OrgSlug.create("");
    expect(result.isFail()).toBe(true);
  });

  it("equals another slug with same value", () => {
    const a = OrgSlug.create("my-org").unwrap();
    const b = OrgSlug.create("my-org").unwrap();
    expect(a.equals(b)).toBe(true);
  });

  it("does not equal slug with different value", () => {
    const a = OrgSlug.create("org-a").unwrap();
    const b = OrgSlug.create("org-b").unwrap();
    expect(a.equals(b)).toBe(false);
  });
});
