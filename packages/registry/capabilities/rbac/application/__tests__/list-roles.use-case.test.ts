import { describe, it, expect, beforeEach } from "vitest";
import { ListRoles } from "../use-cases/list-roles.use-case.js";
import { InMemoryRoleRepository } from "./mocks/role-repository.mock.js";
import { createTestRole } from "./fixtures/role.fixture.js";

describe("ListRoles use case", () => {
  let roleRepo: InMemoryRoleRepository;
  let listRoles: ListRoles;

  beforeEach(() => {
    roleRepo = new InMemoryRoleRepository();
    listRoles = new ListRoles(roleRepo);
  });

  it("returns empty list when no roles exist", async () => {
    const result = await listRoles.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual([]);
  });

  it("returns all roles", async () => {
    const role1 = createTestRole({ id: "r1", name: "admin" });
    const role2 = createTestRole({ id: "r2", name: "editor" });
    await roleRepo.save(role1);
    await roleRepo.save(role2);

    const result = await listRoles.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });
});
