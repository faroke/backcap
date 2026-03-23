import { describe, it, expect } from "vitest";
import { FlagNotFound } from "../errors/flag-not-found.error.js";
import { InvalidFlagKey } from "../errors/invalid-flag-key.error.js";
import { FlagAlreadyInState } from "../errors/flag-already-in-state.error.js";

describe("Feature Flags domain errors", () => {
  describe("FlagNotFound", () => {
    it("creates error with key in message", () => {
      const error = FlagNotFound.create("dark-mode");
      expect(error).toBeInstanceOf(FlagNotFound);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("FlagNotFound");
      expect(error.message).toContain("dark-mode");
    });
  });

  describe("InvalidFlagKey", () => {
    it("creates error with reason in message", () => {
      const error = InvalidFlagKey.create("key must be lowercase");
      expect(error).toBeInstanceOf(InvalidFlagKey);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InvalidFlagKey");
      expect(error.message).toContain("key must be lowercase");
    });
  });

  describe("FlagAlreadyInState", () => {
    it("creates error for enabled state", () => {
      const error = FlagAlreadyInState.create("dark-mode", true);
      expect(error).toBeInstanceOf(FlagAlreadyInState);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("FlagAlreadyInState");
      expect(error.message).toContain("dark-mode");
      expect(error.message).toContain("enabled");
    });

    it("creates error for disabled state", () => {
      const error = FlagAlreadyInState.create("dark-mode", false);
      expect(error.message).toContain("disabled");
    });
  });
});
