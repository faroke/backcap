import { describe, it, expect } from "vitest";
import { Locale } from "../value-objects/locale.vo.js";

describe("Locale", () => {
  it("should accept valid two-letter locale", () => {
    const result = Locale.create("en");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("en");
  });

  it("should accept locale with region", () => {
    const result = Locale.create("fr-FR");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("fr-FR");
  });

  it("should accept locale with script subtag", () => {
    const result = Locale.create("zh-Hans");
    expect(result.isOk()).toBe(true);
  });

  it("should accept sr-Latn", () => {
    const result = Locale.create("sr-Latn");
    expect(result.isOk()).toBe(true);
  });

  it("should accept three-letter language code", () => {
    const result = Locale.create("ast");
    expect(result.isOk()).toBe(true);
  });

  it("should store canonical form", () => {
    const result = Locale.create("en-us");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("en-US");
  });

  it("should reject empty string", () => {
    const result = Locale.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidLocale");
  });

  it("should reject invalid format", () => {
    const result = Locale.create("not-valid-at-all-xyz");
    expect(result.isFail()).toBe(true);
  });

  it("should reject completely invalid string", () => {
    const result = Locale.create("!!!");
    expect(result.isFail()).toBe(true);
  });

  it("should have immutable value", () => {
    const locale = Locale.create("en").unwrap();
    expect(locale.value).toBe("en");
  });
});
