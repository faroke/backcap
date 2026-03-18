import { describe, it, expect, beforeEach } from "vitest";
import { CheckPermission } from "../use-cases/check-permission.use-case.js";
import { InMemoryPermissionResolver } from "./mocks/permission-resolver.mock.js";
import { createTestPermission } from "./fixtures/role.fixture.js";
import { PermissionDenied } from "../../domain/errors/permission-denied.error.js";

describe("CheckPermission use case", () => {
  let permissionResolver: InMemoryPermissionResolver;
  let checkPermission: CheckPermission;

  beforeEach(() => {
    permissionResolver = new InMemoryPermissionResolver();
    checkPermission = new CheckPermission(permissionResolver);
  });

  it("returns true when user has permission", async () => {
    const perm = createTestPermission({ action: "read", resource: "posts" });
    permissionResolver.setPermissions("user-1", [perm]);

    const result = await checkPermission.execute({
      userId: "user-1",
      action: "read",
      resource: "posts",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(true);
  });

  it("returns PermissionDenied when user lacks permission", async () => {
    permissionResolver.setPermissions("user-1", []);

    const result = await checkPermission.execute({
      userId: "user-1",
      action: "delete",
      resource: "posts",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("returns PermissionDenied for invalid action", async () => {
    const result = await checkPermission.execute({
      userId: "user-1",
      action: "invalid-action",
      resource: "posts",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("returns PermissionDenied for invalid resource", async () => {
    const result = await checkPermission.execute({
      userId: "user-1",
      action: "read",
      resource: "",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });

  it("manage permission grants access to any action", async () => {
    const perm = createTestPermission({ action: "manage", resource: "posts" });
    permissionResolver.setPermissions("user-1", [perm]);

    const result = await checkPermission.execute({
      userId: "user-1",
      action: "delete",
      resource: "posts",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(true);
  });
});
