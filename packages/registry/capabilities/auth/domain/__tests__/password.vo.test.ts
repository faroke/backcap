import { describe, it, expect } from "vitest";
import { Password, DomainError } from "../value-objects/password.vo.js";

describe("Password VO", () => {
  it("creates a valid password", () => {
    const result = Password.create("mypassword1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("mypassword1");
  });

  it("accepts password with special characters", () => {
    const result = Password.create("p@ssw0rd!");
    expect(result.isOk()).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = Password.create("short1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(DomainError);
    expect(result.unwrapError().message).toContain("at least 8");
  });

  it("rejects password with only alphabetic characters", () => {
    const result = Password.create("allletters");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("non-alphabetic");
  });

  it("accepts password with numbers as non-alpha", () => {
    const result = Password.create("password1");
    expect(result.isOk()).toBe(true);
  });

  it("is immutable (readonly value)", () => {
    const pw = Password.create("secure123").unwrap();
    expect(pw.value).toBe("secure123");
  });
});
