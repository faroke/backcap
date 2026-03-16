import { describe, it, expect } from "vitest";
import { InvalidEmail } from "../errors/invalid-email.error.js";
import { UserNotFound } from "../errors/user-not-found.error.js";
import { InvalidCredentials } from "../errors/invalid-credentials.error.js";

describe("Domain errors", () => {
  describe("InvalidEmail", () => {
    it("creates with static factory", () => {
      const error = InvalidEmail.create("bad@");
      expect(error).toBeInstanceOf(InvalidEmail);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("bad@");
    });

    it("has correct name", () => {
      expect(new InvalidEmail("test").name).toBe("InvalidEmail");
    });
  });

  describe("UserNotFound", () => {
    it("creates with static factory", () => {
      const error = UserNotFound.create("user-123");
      expect(error).toBeInstanceOf(UserNotFound);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("user-123");
    });

    it("has correct name", () => {
      expect(new UserNotFound("test").name).toBe("UserNotFound");
    });
  });

  describe("InvalidCredentials", () => {
    it("creates with static factory", () => {
      const error = InvalidCredentials.create();
      expect(error).toBeInstanceOf(InvalidCredentials);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Invalid email or password");
    });

    it("has correct name", () => {
      expect(new InvalidCredentials("test").name).toBe("InvalidCredentials");
    });
  });
});
