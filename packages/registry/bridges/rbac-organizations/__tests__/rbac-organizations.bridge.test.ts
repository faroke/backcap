import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../rbac-organizations.bridge.js";

describe("rbac-organizations bridge", () => {
  it("calls assignRole on MemberJoined with org-scoped role", async () => {
    const bus = new InMemoryEventBus();
    const assignRole = {
      execute: vi.fn().mockResolvedValue({ isFail: () => false }),
    };
    const bridge = createBridge({ assignRole, defaultRoleId: "role-member" });

    bridge.wire(bus);

    await bus.publish("MemberJoined", {
      organizationId: "org-1",
      userId: "u-1",
      role: "member",
      occurredAt: new Date("2026-01-01"),
    });

    expect(assignRole.execute).toHaveBeenCalledOnce();
    expect(assignRole.execute).toHaveBeenCalledWith({
      userId: "u-1",
      roleId: "role-member",
      organizationId: "org-1",
    });
  });

  it("logs error when use case returns failure result", async () => {
    const bus = new InMemoryEventBus();
    const assignRole = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => true,
        error: new Error("role not found"),
      }),
    };
    const bridge = createBridge({ assignRole, defaultRoleId: "role-member" });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await bus.publish("MemberJoined", {
      organizationId: "org-1",
      userId: "u-1",
      role: "member",
      occurredAt: new Date("2026-01-01"),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[rbac-organizations] AssignRole failed:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("handles thrown exception gracefully without re-throwing", async () => {
    const bus = new InMemoryEventBus();
    const assignRole = {
      execute: vi.fn().mockRejectedValue(new Error("crash")),
    };
    const bridge = createBridge({ assignRole, defaultRoleId: "role-member" });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await expect(
      bus.publish("MemberJoined", {
        organizationId: "org-1",
        userId: "u-1",
        role: "member",
        occurredAt: new Date("2026-01-01"),
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
