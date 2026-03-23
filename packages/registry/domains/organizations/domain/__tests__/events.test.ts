import { describe, it, expect } from "vitest";
import { OrganizationCreated } from "../events/organization-created.event.js";
import { MemberInvited } from "../events/member-invited.event.js";
import { MemberJoined } from "../events/member-joined.event.js";
import { MemberRemoved } from "../events/member-removed.event.js";

describe("Domain events", () => {
  describe("OrganizationCreated", () => {
    it("constructs with all properties", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const event = new OrganizationCreated("org-1", "My Org", "my-org", "user-1", date);
      expect(event.organizationId).toBe("org-1");
      expect(event.name).toBe("My Org");
      expect(event.slug).toBe("my-org");
      expect(event.ownerId).toBe("user-1");
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt to now", () => {
      const before = new Date();
      const event = new OrganizationCreated("org-1", "My Org", "my-org", "user-1");
      const after = new Date();
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("MemberInvited", () => {
    it("constructs with all properties", () => {
      const event = new MemberInvited("org-1", "invite@example.com", "member", "user-1");
      expect(event.organizationId).toBe("org-1");
      expect(event.invitedEmail).toBe("invite@example.com");
      expect(event.role).toBe("member");
      expect(event.invitedBy).toBe("user-1");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });

  describe("MemberJoined", () => {
    it("constructs with all properties", () => {
      const event = new MemberJoined("org-1", "user-2", "member");
      expect(event.organizationId).toBe("org-1");
      expect(event.userId).toBe("user-2");
      expect(event.role).toBe("member");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });

  describe("MemberRemoved", () => {
    it("constructs with all properties", () => {
      const event = new MemberRemoved("org-1", "user-2", "user-1");
      expect(event.organizationId).toBe("org-1");
      expect(event.userId).toBe("user-2");
      expect(event.removedBy).toBe("user-1");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });
});
