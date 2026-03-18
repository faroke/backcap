import { describe, it, expect } from "vitest";
import { Role } from "../entities/role.entity.js";
import { Permission } from "../entities/permission.entity.js";
import { InvalidRoleName } from "../errors/invalid-role-name.error.js";

describe("Role entity", () => {
  const validParams = {
    id: "role-1",
    name: "admin",
    description: "Administrator role",
  };

  it("creates a valid role", () => {
    const result = Role.create(validParams);
    expect(result.isOk()).toBe(true);
    const role = result.unwrap();
    expect(role.id).toBe("role-1");
    expect(role.name).toBe("admin");
    expect(role.description).toBe("Administrator role");
    expect(role.permissions).toEqual([]);
    expect(role.createdAt).toBeInstanceOf(Date);
    expect(role.updatedAt).toBeInstanceOf(Date);
  });

  it("trims name", () => {
    const result = Role.create({ ...validParams, name: "  admin  " });
    expect(result.unwrap().name).toBe("admin");
  });

  it("creates with permissions", () => {
    const perm = Permission.create({ id: "p1", action: "read", resource: "posts" }).unwrap();
    const result = Role.create({ ...validParams, permissions: [perm] });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().permissions).toHaveLength(1);
  });

  it("fails with empty name", () => {
    const result = Role.create({ ...validParams, name: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRoleName);
  });

  it("fails with whitespace-only name", () => {
    const result = Role.create({ ...validParams, name: "   " });
    expect(result.isFail()).toBe(true);
  });

  it("addPermission returns new role with permission", () => {
    const role = Role.create(validParams).unwrap();
    const perm = Permission.create({ id: "p1", action: "read", resource: "posts" }).unwrap();
    const updated = role.addPermission(perm);
    expect(updated.permissions).toHaveLength(1);
    expect(role.permissions).toHaveLength(0); // original unchanged
  });

  it("removePermission returns new role without permission", () => {
    const perm = Permission.create({ id: "p1", action: "read", resource: "posts" }).unwrap();
    const role = Role.create({ ...validParams, permissions: [perm] }).unwrap();
    const updated = role.removePermission("p1");
    expect(updated.permissions).toHaveLength(0);
    expect(role.permissions).toHaveLength(1); // original unchanged
  });
});
