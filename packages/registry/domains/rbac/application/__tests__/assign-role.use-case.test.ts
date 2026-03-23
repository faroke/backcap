import { describe, it, expect, beforeEach } from "vitest";
import { AssignRole } from "../use-cases/assign-role.use-case.js";
import { InMemoryRoleRepository } from "./mocks/role-repository.mock.js";
import { createTestRole } from "./fixtures/role.fixture.js";
import { RoleNotFound } from "../../domain/errors/role-not-found.error.js";
import { RoleAssigned } from "../../domain/events/role-assigned.event.js";

describe("AssignRole use case", () => {
  let roleRepo: InMemoryRoleRepository;
  let assignRole: AssignRole;

  beforeEach(() => {
    roleRepo = new InMemoryRoleRepository();
    assignRole = new AssignRole(roleRepo);
  });

  it("assigns role to user successfully", async () => {
    const role = createTestRole({ id: "role-1" });
    await roleRepo.save(role);

    const result = await assignRole.execute({
      userId: "user-1",
      roleId: "role-1",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.event).toBeInstanceOf(RoleAssigned);
    expect(output.event.userId).toBe("user-1");
    expect(output.event.roleId).toBe("role-1");

    const userRoles = await roleRepo.findByUserId("user-1");
    expect(userRoles).toHaveLength(1);
  });

  it("fails when role does not exist", async () => {
    const result = await assignRole.execute({
      userId: "user-1",
      roleId: "nonexistent",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(RoleNotFound);
  });
});
