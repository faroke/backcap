import { describe, it, expect } from "vitest";
import { FlagKey } from "../value-objects/flag-key.vo.js";
import { InvalidFlagKey } from "../errors/invalid-flag-key.error.js";

describe("FlagKey VO", () => {
  it("creates a valid flag key", () => {
    const result = FlagKey.create("my-flag");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("my-flag");
  });

  it("accepts key with underscores", () => {
    const result = FlagKey.create("my_flag_key");
    expect(result.isOk()).toBe(true);
  });

  it("accepts key with digits", () => {
    const result = FlagKey.create("feature1");
    expect(result.isOk()).toBe(true);
  });

  it("accepts minimum length key (2 chars)", () => {
    const result = FlagKey.create("ab");
    expect(result.isOk()).toBe(true);
  });

  it("accepts maximum length key (64 chars)", () => {
    const key = "a" + "b".repeat(63);
    const result = FlagKey.create(key);
    expect(result.isOk()).toBe(true);
  });

  it("rejects uppercase letters", () => {
    const result = FlagKey.create("MyFlag");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("rejects spaces", () => {
    const result = FlagKey.create("my flag");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("rejects too short key (1 char)", () => {
    const result = FlagKey.create("a");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("rejects too long key (65 chars)", () => {
    const key = "a" + "b".repeat(64);
    const result = FlagKey.create(key);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("rejects key starting with digit", () => {
    const result = FlagKey.create("1flag");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("rejects key starting with underscore", () => {
    const result = FlagKey.create("_flag");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("rejects empty string", () => {
    const result = FlagKey.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });
});
