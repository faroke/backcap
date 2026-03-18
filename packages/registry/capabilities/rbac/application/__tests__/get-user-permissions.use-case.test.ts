import { describe, it, expect, beforeEach } from "vitest";
import { GetUserPermissions } from "../use-cases/get-user-permissions.use-case.js";
import { InMemoryPermissionResolver } from "./mocks/permission-resolver.mock.js";
import { createTestPermission } from "./fixtures/role.fixture.js";

describe("GetUserPermissions use case", () => {
  let permissionResolver: InMemoryPermissionResolver;
  let getUserPermissions: GetUserPermissions;

  beforeEach(() => {
    permissionResolver = new InMemoryPermissionResolver();
    getUserPermissions = new GetUserPermissions(permissionResolver);
  });

  it("returns empty list when user has no permissions", async () => {
    const result = await getUserPermissions.execute({ userId: "user-1" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual([]);
  });

  it("returns all user permissions", async () => {
    const perm1 = createTestPermission({ id: "p1", action: "read", resource: "posts" });
    const perm2 = createTestPermission({ id: "p2", action: "create", resource: "posts" });
    permissionResolver.setPermissions("user-1", [perm1, perm2]);

    const result = await getUserPermissions.execute({ userId: "user-1" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });
});
