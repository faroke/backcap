import { describe, it, expect } from "vitest";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";

describe("PermissionAction VO", () => {
  it("creates valid actions", () => {
    for (const action of ["create", "read", "update", "delete", "manage"]) {
      const result = PermissionAction.create(action);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe(action);
    }
  });

  it("fails with invalid action", () => {
    const result = PermissionAction.create("invalid");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
    expect(result.unwrapError().message).toContain("invalid");
  });

  it("equals compares values", () => {
    const a = PermissionAction.create("read").unwrap();
    const b = PermissionAction.create("read").unwrap();
    expect(a.equals(b)).toBe(true);
  });

  it("rejects write as invalid action", () => {
    expect(PermissionAction.create("write").isFail()).toBe(true);
  });

  it("manage includes all actions", () => {
    const manage = PermissionAction.create("manage").unwrap();
    const read = PermissionAction.create("read").unwrap();
    const create = PermissionAction.create("create").unwrap();
    expect(manage.includes(read)).toBe(true);
    expect(manage.includes(create)).toBe(true);
  });

  it("non-manage only includes itself", () => {
    const read = PermissionAction.create("read").unwrap();
    const create = PermissionAction.create("create").unwrap();
    expect(read.includes(create)).toBe(false);
    expect(read.includes(read)).toBe(true);
  });
});
