import { describe, it, expect } from "vitest";
import { RoleAssigned } from "../events/role-assigned.event.js";
import { RoleRevoked } from "../events/role-revoked.event.js";
import { PermissionGranted } from "../events/permission-granted.event.js";

describe("Domain events", () => {
  describe("RoleAssigned", () => {
    it("creates with default occurredAt", () => {
      const event = new RoleAssigned("user-1", "role-1");
      expect(event.userId).toBe("user-1");
      expect(event.roleId).toBe("role-1");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });

    it("creates with custom occurredAt", () => {
      const date = new Date("2026-01-01");
      const event = new RoleAssigned("user-1", "role-1", undefined, date);
      expect(event.occurredAt).toBe(date);
    });

    it("creates with organizationId", () => {
      const event = new RoleAssigned("user-1", "role-1", "org-1");
      expect(event.organizationId).toBe("org-1");
    });
  });

  describe("RoleRevoked", () => {
    it("creates with default occurredAt", () => {
      const event = new RoleRevoked("user-1", "role-1");
      expect(event.userId).toBe("user-1");
      expect(event.roleId).toBe("role-1");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });

  describe("PermissionGranted", () => {
    it("creates with all fields", () => {
      const event = new PermissionGranted("role-1", "perm-1", "read", "posts");
      expect(event.roleId).toBe("role-1");
      expect(event.permissionId).toBe("perm-1");
      expect(event.action).toBe("read");
      expect(event.resource).toBe("posts");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });
});
