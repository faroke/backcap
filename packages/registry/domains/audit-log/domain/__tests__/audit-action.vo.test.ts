import { describe, it, expect } from "vitest";
import { AuditAction } from "../value-objects/audit-action.vo.js";
import { InvalidAuditAction } from "../errors/invalid-audit-action.error.js";

describe("AuditAction VO", () => {
  it("creates a valid action (USER.LOGIN)", () => {
    const result = AuditAction.create("USER.LOGIN");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("USER.LOGIN");
  });

  it("accepts action with underscores and digits", () => {
    const result = AuditAction.create("FEATURE_FLAG.TOGGLE_ON");
    expect(result.isOk()).toBe(true);
  });

  it("accepts action with digits in noun", () => {
    const result = AuditAction.create("API2.CALL");
    expect(result.isOk()).toBe(true);
  });

  it("rejects lowercase action", () => {
    const result = AuditAction.create("user.login");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });

  it("rejects action without dot separator", () => {
    const result = AuditAction.create("USERLOGIN");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });

  it("rejects empty string", () => {
    const result = AuditAction.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });

  it("rejects action with only dot", () => {
    const result = AuditAction.create(".");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });

  it("rejects mixed case", () => {
    const result = AuditAction.create("User.Login");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAuditAction);
  });
});
