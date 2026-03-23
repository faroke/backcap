import { describe, it, expect } from "vitest";
import { RoleNotFound } from "../errors/role-not-found.error.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";
import { DuplicateRole } from "../errors/duplicate-role.error.js";
import { InvalidRoleName } from "../errors/invalid-role-name.error.js";

describe("Domain errors", () => {
  describe("RoleNotFound", () => {
    it("creates with static factory", () => {
      const error = RoleNotFound.create("role-123");
      expect(error).toBeInstanceOf(RoleNotFound);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("role-123");
    });

    it("has correct name", () => {
      expect(new RoleNotFound("test").name).toBe("RoleNotFound");
    });
  });

  describe("PermissionDenied", () => {
    it("creates with static factory", () => {
      const error = PermissionDenied.create("user-1", "delete", "posts");
      expect(error).toBeInstanceOf(PermissionDenied);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("user-1");
      expect(error.message).toContain("delete");
      expect(error.message).toContain("posts");
    });

    it("has correct name", () => {
      expect(new PermissionDenied("test").name).toBe("PermissionDenied");
    });
  });

  describe("DuplicateRole", () => {
    it("creates with static factory", () => {
      const error = DuplicateRole.create("admin");
      expect(error).toBeInstanceOf(DuplicateRole);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("admin");
    });

    it("has correct name", () => {
      expect(new DuplicateRole("test").name).toBe("DuplicateRole");
    });
  });

  describe("InvalidRoleName", () => {
    it("creates with static factory", () => {
      const error = InvalidRoleName.create("");
      expect(error).toBeInstanceOf(InvalidRoleName);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Invalid role name");
    });

    it("has correct name", () => {
      expect(new InvalidRoleName("test").name).toBe("InvalidRoleName");
    });
  });
});
