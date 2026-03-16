import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../auth-audit-log.bridge.js";

describe("auth-audit-log bridge", () => {
  it("calls recordEntry on UserRegistered", async () => {
    const bus = new InMemoryEventBus();
    const recordEntry = { execute: vi.fn().mockResolvedValue(undefined) };
    const bridge = createBridge({ recordEntry });

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
    });

    expect(recordEntry.execute).toHaveBeenCalledOnce();
    expect(recordEntry.execute).toHaveBeenCalledWith({
      actor: "u-1",
      action: "USER.REGISTERED",
      resource: "user@example.com",
    });
  });

  it("calls recordEntry on LoginSucceeded", async () => {
    const bus = new InMemoryEventBus();
    const recordEntry = { execute: vi.fn().mockResolvedValue(undefined) };
    const bridge = createBridge({ recordEntry });

    bridge.wire(bus);

    await bus.publish("LoginSucceeded", { userId: "u-2" });

    expect(recordEntry.execute).toHaveBeenCalledOnce();
    expect(recordEntry.execute).toHaveBeenCalledWith({
      actor: "u-2",
      action: "USER.LOGIN",
      resource: "u-2",
    });
  });

  it("handles use case failure gracefully without throwing", async () => {
    const bus = new InMemoryEventBus();
    const recordEntry = {
      execute: vi.fn().mockRejectedValue(new Error("db down")),
    };
    const bridge = createBridge({ recordEntry });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await expect(
      bus.publish("UserRegistered", {
        userId: "u-1",
        email: "user@example.com",
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
