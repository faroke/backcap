import { describe, it, expect } from "vitest";
import { User } from "../entities/user.entity.js";
import { InvalidEmail } from "../errors/invalid-email.error.js";

describe("User entity", () => {
  const validParams = {
    id: "user-1",
    email: "user@example.com",
    passwordHash: "hashed_password_123",
  };

  it("creates a valid user", () => {
    const result = User.create(validParams);
    expect(result.isOk()).toBe(true);
    const user = result.unwrap();
    expect(user.id).toBe("user-1");
    expect(user.email.value).toBe("user@example.com");
    expect(user.passwordHash).toBe("hashed_password_123");
    expect(user.roles).toEqual(["user"]);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("creates user with custom roles", () => {
    const result = User.create({ ...validParams, roles: ["admin", "user"] });
    expect(result.unwrap().roles).toEqual(["admin", "user"]);
  });

  it("fails with invalid email", () => {
    const result = User.create({ ...validParams, email: "invalid" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidEmail);
  });

  it("updateEmail with valid email returns new user", () => {
    const user = User.create(validParams).unwrap();
    const result = user.updateEmail("new@example.com");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().email.value).toBe("new@example.com");
    // Original unchanged
    expect(user.email.value).toBe("user@example.com");
  });

  it("updateEmail with invalid email fails", () => {
    const user = User.create(validParams).unwrap();
    const result = user.updateEmail("bad-email");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidEmail);
  });
});
