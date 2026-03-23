import { describe, it, expect } from "vitest";
import { Permission } from "../entities/permission.entity.js";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { ResourceType } from "../value-objects/resource-type.vo.js";
import { PermissionDenied } from "../errors/permission-denied.error.js";

describe("Permission entity", () => {
  const validParams = {
    id: "perm-1",
    action: "read",
    resource: "posts",
  };

  it("creates a valid permission", () => {
    const result = Permission.create(validParams);
    expect(result.isOk()).toBe(true);
    const perm = result.unwrap();
    expect(perm.id).toBe("perm-1");
    expect(perm.action.value).toBe("read");
    expect(perm.resource.value).toBe("posts");
    expect(perm.conditions).toEqual({});
    expect(perm.createdAt).toBeInstanceOf(Date);
  });

  it("creates with conditions", () => {
    const result = Permission.create({
      ...validParams,
      conditions: { ownOnly: true },
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().conditions).toEqual({ ownOnly: true });
  });

  it("fails with invalid action", () => {
    const result = Permission.create({ ...validParams, action: "invalid" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("fails with invalid resource", () => {
    const result = Permission.create({ ...validParams, resource: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("matches exact action and resource", () => {
    const perm = Permission.create(validParams).unwrap();
    const action = PermissionAction.create("read").unwrap();
    const resource = ResourceType.create("posts").unwrap();
    expect(perm.matches(action, resource)).toBe(true);
  });

  it("manage permission matches any action", () => {
    const perm = Permission.create({ ...validParams, action: "manage" }).unwrap();
    const action = PermissionAction.create("delete").unwrap();
    const resource = ResourceType.create("posts").unwrap();
    expect(perm.matches(action, resource)).toBe(true);
  });

  it("does not match different resource", () => {
    const perm = Permission.create(validParams).unwrap();
    const action = PermissionAction.create("read").unwrap();
    const resource = ResourceType.create("users").unwrap();
    expect(perm.matches(action, resource)).toBe(false);
  });
});
