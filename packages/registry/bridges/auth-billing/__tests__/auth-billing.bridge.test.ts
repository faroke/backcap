import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../auth-billing.bridge.js";

describe("auth-billing bridge", () => {
  it("calls createCustomer on UserRegistered", async () => {
    const bus = new InMemoryEventBus();
    const createCustomer = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => false,
        unwrap: () => ({ customerId: "cust-1" }),
      }),
    };
    const bridge = createBridge({ createCustomer });

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(createCustomer.execute).toHaveBeenCalledOnce();
    expect(createCustomer.execute).toHaveBeenCalledWith({
      id: "u-1",
      email: "user@example.com",
      name: "user",
    });
  });

  it("falls back to full email as name when local part is empty", async () => {
    const bus = new InMemoryEventBus();
    const createCustomer = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => false,
        unwrap: () => ({ customerId: "cust-2" }),
      }),
    };
    const bridge = createBridge({ createCustomer });

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-2",
      email: "@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(createCustomer.execute).toHaveBeenCalledWith({
      id: "u-2",
      email: "@example.com",
      name: "@example.com",
    });
  });

  it("logs error on failure result without throwing", async () => {
    const bus = new InMemoryEventBus();
    const err = new Error("duplicate customer");
    const createCustomer = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => true,
        unwrapError: () => err,
      }),
    };
    const bridge = createBridge({ createCustomer });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[auth-billing] CreateCustomer failed:",
      err,
    );
    consoleSpy.mockRestore();
  });

  it("handles thrown exception gracefully without re-throwing", async () => {
    const bus = new InMemoryEventBus();
    const createCustomer = {
      execute: vi.fn().mockRejectedValue(new Error("crash")),
    };
    const bridge = createBridge({ createCustomer });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await expect(
      bus.publish("UserRegistered", {
        userId: "u-1",
        email: "user@example.com",
        occurredAt: new Date("2026-01-01"),
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "[auth-billing] Failed to create billing customer:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
