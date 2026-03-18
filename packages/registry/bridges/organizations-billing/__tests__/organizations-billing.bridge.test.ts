import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../organizations-billing.bridge.js";

describe("organizations-billing bridge", () => {
  it("calls createCustomer on OrganizationCreated with org context", async () => {
    const bus = new InMemoryEventBus();
    const createCustomer = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => false,
        unwrap: () => ({ customerId: "cust-org-1" }),
      }),
    };
    const bridge = createBridge({ createCustomer });

    bridge.wire(bus);

    await bus.publish("OrganizationCreated", {
      organizationId: "org-1",
      name: "Acme Corp",
      slug: "acme-corp",
      ownerId: "u-1",
      occurredAt: new Date("2026-01-01"),
    });

    expect(createCustomer.execute).toHaveBeenCalledOnce();
    expect(createCustomer.execute).toHaveBeenCalledWith({
      id: "org-1",
      email: "billing+acme-corp@org.internal",
      name: "Acme Corp",
    });
  });

  it("sanitizes slug with special characters in email", async () => {
    const bus = new InMemoryEventBus();
    const createCustomer = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => false,
        unwrap: () => ({ customerId: "cust-org-2" }),
      }),
    };
    const bridge = createBridge({ createCustomer });

    bridge.wire(bus);

    await bus.publish("OrganizationCreated", {
      organizationId: "org-2",
      name: "Bad@Slug Corp",
      slug: "bad@slug corp!",
      ownerId: "u-1",
      occurredAt: new Date("2026-01-01"),
    });

    expect(createCustomer.execute).toHaveBeenCalledWith({
      id: "org-2",
      email: "billing+badslugcorp@org.internal",
      name: "Bad@Slug Corp",
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

    await bus.publish("OrganizationCreated", {
      organizationId: "org-1",
      name: "Acme Corp",
      slug: "acme-corp",
      ownerId: "u-1",
      occurredAt: new Date("2026-01-01"),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[organizations-billing] CreateCustomer failed:",
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
      bus.publish("OrganizationCreated", {
        organizationId: "org-1",
        name: "Acme Corp",
        slug: "acme-corp",
        ownerId: "u-1",
        occurredAt: new Date("2026-01-01"),
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "[organizations-billing] Failed to create org billing customer:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
