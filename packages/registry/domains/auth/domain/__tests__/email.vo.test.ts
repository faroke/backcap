import { describe, it, expect } from "vitest";
import { Email } from "../value-objects/email.vo.js";
import { InvalidEmail } from "../errors/invalid-email.error.js";

describe("Email VO", () => {
  it("creates a valid email", () => {
    const result = Email.create("user@example.com");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("user@example.com");
  });

  it("accepts email with subdomain", () => {
    const result = Email.create("user@mail.example.com");
    expect(result.isOk()).toBe(true);
  });

  it("accepts email with plus addressing", () => {
    const result = Email.create("user+tag@example.com");
    expect(result.isOk()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = Email.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidEmail);
  });

  it("rejects missing @", () => {
    const result = Email.create("userexample.com");
    expect(result.isFail()).toBe(true);
  });

  it("rejects missing domain", () => {
    const result = Email.create("user@");
    expect(result.isFail()).toBe(true);
  });

  it("rejects missing local part", () => {
    const result = Email.create("@example.com");
    expect(result.isFail()).toBe(true);
  });

  it("is immutable (readonly value)", () => {
    const email = Email.create("user@example.com").unwrap();
    expect(email.value).toBe("user@example.com");
  });
});
