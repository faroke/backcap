import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../auth-rbac.bridge.js";

describe("auth-rbac bridge", () => {
  it("calls assignRole on UserRegistered with default role", async () => {
    const bus = new InMemoryEventBus();
    const assignRole = {
      execute: vi.fn().mockResolvedValue({ isFail: () => false }),
    };
    const bridge = createBridge({ assignRole, defaultRoleId: "role-member" });

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(assignRole.execute).toHaveBeenCalledOnce();
    expect(assignRole.execute).toHaveBeenCalledWith({
      userId: "u-1",
      roleId: "role-member",
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

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[auth-rbac] AssignRole failed:",
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
      bus.publish("UserRegistered", {
        userId: "u-1",
        email: "user@example.com",
        occurredAt: new Date("2026-01-01"),
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
