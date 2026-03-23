import { describe, it, expect } from "vitest";
import { Membership } from "../entities/membership.entity.js";

describe("Membership entity", () => {
  const validParams = {
    id: "mem-1",
    userId: "user-1",
    organizationId: "org-1",
    role: "member",
  };

  it("creates a valid membership", () => {
    const result = Membership.create(validParams);
    expect(result.isOk()).toBe(true);
    const membership = result.unwrap();
    expect(membership.id).toBe("mem-1");
    expect(membership.userId).toBe("user-1");
    expect(membership.organizationId).toBe("org-1");
    expect(membership.role.value).toBe("member");
    expect(membership.joinedAt).toBeInstanceOf(Date);
  });

  it("creates with owner role", () => {
    const result = Membership.create({ ...validParams, role: "owner" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().role.isOwner()).toBe(true);
  });

  it("fails with invalid role", () => {
    const result = Membership.create({ ...validParams, role: "superuser" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("superuser");
  });

  it("changeRole returns new membership with updated role", () => {
    const membership = Membership.create(validParams).unwrap();
    const result = membership.changeRole("admin");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().role.value).toBe("admin");
    // Original unchanged
    expect(membership.role.value).toBe("member");
  });

  it("changeRole fails with invalid role", () => {
    const membership = Membership.create(validParams).unwrap();
    const result = membership.changeRole("invalid");
    expect(result.isFail()).toBe(true);
  });
});
