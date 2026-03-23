import { describe, it, expect } from "vitest";
import { OrgNotFound } from "../errors/org-not-found.error.js";
import { OrgSlugTaken } from "../errors/org-slug-taken.error.js";
import { MemberAlreadyExists } from "../errors/member-already-exists.error.js";
import { CannotRemoveOwner } from "../errors/cannot-remove-owner.error.js";

describe("Domain errors", () => {
  describe("OrgNotFound", () => {
    it("creates with static factory", () => {
      const error = OrgNotFound.create("org-123");
      expect(error).toBeInstanceOf(OrgNotFound);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("org-123");
    });

    it("has correct name", () => {
      expect(new OrgNotFound("test").name).toBe("OrgNotFound");
    });
  });

  describe("OrgSlugTaken", () => {
    it("creates with static factory", () => {
      const error = OrgSlugTaken.create("my-org");
      expect(error).toBeInstanceOf(OrgSlugTaken);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("my-org");
    });

    it("has correct name", () => {
      expect(new OrgSlugTaken("test").name).toBe("OrgSlugTaken");
    });
  });

  describe("MemberAlreadyExists", () => {
    it("creates with static factory", () => {
      const error = MemberAlreadyExists.create("user-1", "org-1");
      expect(error).toBeInstanceOf(MemberAlreadyExists);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("user-1");
      expect(error.message).toContain("org-1");
    });

    it("has correct name", () => {
      expect(new MemberAlreadyExists("test").name).toBe("MemberAlreadyExists");
    });
  });

  describe("CannotRemoveOwner", () => {
    it("creates with static factory", () => {
      const error = CannotRemoveOwner.create("org-1");
      expect(error).toBeInstanceOf(CannotRemoveOwner);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("org-1");
    });

    it("has correct name", () => {
      expect(new CannotRemoveOwner("test").name).toBe("CannotRemoveOwner");
    });
  });
});
