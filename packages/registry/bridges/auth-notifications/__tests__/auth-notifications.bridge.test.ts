import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../auth-notifications.bridge.js";

describe("auth-notifications bridge", () => {
  it("calls sendWelcomeEmail on UserRegistered", async () => {
    const bus = new InMemoryEventBus();
    const sendWelcomeEmail = {
      execute: vi.fn().mockResolvedValue({ isFail: () => false }),
    };
    const bridge = createBridge({ sendWelcomeEmail });

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(sendWelcomeEmail.execute).toHaveBeenCalledOnce();
    expect(sendWelcomeEmail.execute).toHaveBeenCalledWith({
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });
  });

  it("logs error when use case returns failure result", async () => {
    const bus = new InMemoryEventBus();
    const sendWelcomeEmail = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => true,
        error: new Error("email service down"),
      }),
    };
    const bridge = createBridge({ sendWelcomeEmail });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[auth-notifications] SendWelcomeEmail failed:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("handles thrown exception gracefully without re-throwing", async () => {
    const bus = new InMemoryEventBus();
    const sendWelcomeEmail = {
      execute: vi.fn().mockRejectedValue(new Error("crash")),
    };
    const bridge = createBridge({ sendWelcomeEmail });
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
