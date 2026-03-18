import { describe, it, expect, beforeEach } from "vitest";
import { RevokeRole } from "../use-cases/revoke-role.use-case.js";
import { InMemoryRoleRepository } from "./mocks/role-repository.mock.js";
import { createTestRole } from "./fixtures/role.fixture.js";
import { RoleNotFound } from "../../domain/errors/role-not-found.error.js";
import { RoleRevoked } from "../../domain/events/role-revoked.event.js";

describe("RevokeRole use case", () => {
  let roleRepo: InMemoryRoleRepository;
  let revokeRole: RevokeRole;

  beforeEach(() => {
    roleRepo = new InMemoryRoleRepository();
    revokeRole = new RevokeRole(roleRepo);
  });

  it("revokes role from user successfully", async () => {
    const role = createTestRole({ id: "role-1" });
    await roleRepo.save(role);
    await roleRepo.assignToUser("user-1", "role-1");

    const result = await revokeRole.execute({
      userId: "user-1",
      roleId: "role-1",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.event).toBeInstanceOf(RoleRevoked);
    expect(output.event.userId).toBe("user-1");
    expect(output.event.roleId).toBe("role-1");

    const userRoles = await roleRepo.findByUserId("user-1");
    expect(userRoles).toHaveLength(0);
  });

  it("fails when user does not have the role", async () => {
    const role = createTestRole({ id: "role-1" });
    await roleRepo.save(role);

    const result = await revokeRole.execute({
      userId: "user-1",
      roleId: "role-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(RoleNotFound);
  });

  it("fails when role does not exist", async () => {
    const result = await revokeRole.execute({
      userId: "user-1",
      roleId: "nonexistent",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(RoleNotFound);
  });
});
