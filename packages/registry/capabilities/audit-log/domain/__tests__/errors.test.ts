import { describe, it, expect } from "vitest";
import { InvalidAuditAction } from "../errors/invalid-audit-action.error.js";
import { AuditQueryFailed } from "../errors/audit-query-failed.error.js";

describe("Audit Log domain errors", () => {
  describe("InvalidAuditAction", () => {
    it("creates error with value in message", () => {
      const error = InvalidAuditAction.create("bad-action");
      expect(error).toBeInstanceOf(InvalidAuditAction);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InvalidAuditAction");
      expect(error.message).toContain("bad-action");
    });
  });

  describe("AuditQueryFailed", () => {
    it("creates error with reason in message", () => {
      const error = AuditQueryFailed.create("connection timeout");
      expect(error).toBeInstanceOf(AuditQueryFailed);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("AuditQueryFailed");
      expect(error.message).toContain("connection timeout");
    });
  });
});
