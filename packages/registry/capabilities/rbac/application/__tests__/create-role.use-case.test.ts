import { describe, it, expect, beforeEach } from "vitest";
import { CreateRole } from "../use-cases/create-role.use-case.js";
import { InMemoryRoleRepository } from "./mocks/role-repository.mock.js";
import { createTestRole } from "./fixtures/role.fixture.js";
import { DuplicateRole } from "../../domain/errors/duplicate-role.error.js";
import { PermissionDenied } from "../../domain/errors/permission-denied.error.js";

describe("CreateRole use case", () => {
  let roleRepo: InMemoryRoleRepository;
  let createRole: CreateRole;

  beforeEach(() => {
    roleRepo = new InMemoryRoleRepository();
    createRole = new CreateRole(roleRepo);
  });

  it("creates a new role successfully", async () => {
    const result = await createRole.execute({
      name: "admin",
      description: "Administrator",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.roleId).toBeDefined();
    expect(output.events).toHaveLength(0);

    const saved = await roleRepo.findByName("admin");
    expect(saved).not.toBeNull();
    expect(saved!.name).toBe("admin");
  });

  it("creates role with permissions and emits PermissionGranted events", async () => {
    const result = await createRole.execute({
      name: "editor",
      description: "Can edit posts",
      permissions: [
        { action: "read", resource: "posts" },
        { action: "update", resource: "posts" },
      ],
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.events).toHaveLength(2);
    expect(output.events[0]!.action).toBe("read");
    expect(output.events[0]!.resource).toBe("posts");
    expect(output.events[1]!.action).toBe("update");

    const saved = await roleRepo.findByName("editor");
    expect(saved!.permissions).toHaveLength(2);
  });

  it("rejects duplicate role name", async () => {
    const existing = createTestRole({ name: "admin" });
    await roleRepo.save(existing);

    const result = await createRole.execute({
      name: "admin",
      description: "Another admin",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(DuplicateRole);
  });

  it("rejects invalid permission action", async () => {
    const result = await createRole.execute({
      name: "bad-role",
      description: "Has invalid permission",
      permissions: [{ action: "invalid", resource: "posts" }],
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PermissionDenied);
  });
});
