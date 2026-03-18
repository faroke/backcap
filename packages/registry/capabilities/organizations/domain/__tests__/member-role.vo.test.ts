import { describe, it, expect } from "vitest";
import { MemberRole } from "../value-objects/member-role.vo.js";

describe("MemberRole VO", () => {
  it.each(["owner", "admin", "member", "viewer"])("creates valid role: %s", (role) => {
    const result = MemberRole.create(role);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(role);
  });

  it("rejects invalid role", () => {
    const result = MemberRole.create("superadmin");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("superadmin");
  });

  it("rejects empty string", () => {
    const result = MemberRole.create("");
    expect(result.isFail()).toBe(true);
  });

  it("isOwner returns true for owner", () => {
    const role = MemberRole.create("owner").unwrap();
    expect(role.isOwner()).toBe(true);
  });

  it("isOwner returns false for non-owner", () => {
    const role = MemberRole.create("admin").unwrap();
    expect(role.isOwner()).toBe(false);
  });

  it("isAtLeast checks hierarchy correctly", () => {
    const owner = MemberRole.create("owner").unwrap();
    const admin = MemberRole.create("admin").unwrap();
    const member = MemberRole.create("member").unwrap();
    const viewer = MemberRole.create("viewer").unwrap();

    expect(owner.isAtLeast("viewer")).toBe(true);
    expect(owner.isAtLeast("owner")).toBe(true);
    expect(admin.isAtLeast("member")).toBe(true);
    expect(admin.isAtLeast("owner")).toBe(false);
    expect(viewer.isAtLeast("member")).toBe(false);
    expect(member.isAtLeast("member")).toBe(true);
  });

  it("equals another role with same value", () => {
    const a = MemberRole.create("admin").unwrap();
    const b = MemberRole.create("admin").unwrap();
    expect(a.equals(b)).toBe(true);
  });

  it("does not equal role with different value", () => {
    const a = MemberRole.create("admin").unwrap();
    const b = MemberRole.create("member").unwrap();
    expect(a.equals(b)).toBe(false);
  });
});
