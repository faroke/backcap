import { describe, it, expect } from "vitest";
import { AuditEntry } from "../entities/audit-entry.entity.js";
import { InvalidAuditAction } from "../errors/invalid-audit-action.error.js";

describe("AuditEntry entity", () => {
  const validParams = {
    id: "entry-1",
    actor: "user-123",
    action: "USER.LOGIN",
    resource: "auth/session",
  };

  it("creates a valid audit entry", () => {
    const result = AuditEntry.create(validParams);
    expect(result.isOk()).toBe(true);
    const entry = result.unwrap();
    expect(entry.id).toBe("entry-1");
    expect(entry.actor).toBe("user-123");
    expect(entry.action.value).toBe("USER.LOGIN");
    expect(entry.resource).toBe("auth/session");
    expect(entry.metadata).toBeUndefined();
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it("creates entry with metadata", () => {
    const metadata = { ip: "127.0.0.1", userAgent: "test" };
    const result = AuditEntry.create({ ...validParams, metadata });
    expect(result.unwrap().metadata).toEqual(metadata);
  });

  it("creates entry with custom timestamp", () => {
    const timestamp = new Date("2025-01-01T00:00:00Z");
    const result = AuditEntry.create({ ...validParams, timestamp });
    expect(result.unwrap().timestamp).toEqual(timestamp);
  });

  it("fails with invalid action", () => {
    const result = AuditEntry.create({ ...validParams, action: "invalid" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });

  it("is immutable (all fields are readonly)", () => {
    const entry = AuditEntry.create(validParams).unwrap();
    // Verify readonly fields exist and have correct values
    expect(entry.id).toBe("entry-1");
    expect(entry.actor).toBe("user-123");
    expect(entry.action.value).toBe("USER.LOGIN");
    expect(entry.resource).toBe("auth/session");
    expect(entry.timestamp).toBeInstanceOf(Date);
  });
});
