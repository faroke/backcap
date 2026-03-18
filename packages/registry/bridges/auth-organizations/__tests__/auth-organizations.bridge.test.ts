import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../auth-organizations.bridge.js";

describe("auth-organizations bridge", () => {
  it("calls createOrganization on UserRegistered with personal org", async () => {
    const bus = new InMemoryEventBus();
    const orgEvent = { organizationId: "org-1", name: "Personal", slug: "personal-u-1", ownerId: "u-1" };
    const createOrganization = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => false,
        unwrap: () => ({ organizationId: "org-1", event: orgEvent }),
      }),
    };
    const bridge = createBridge({ createOrganization });

    bridge.wire(bus);

    await bus.publish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(createOrganization.execute).toHaveBeenCalledOnce();
    expect(createOrganization.execute).toHaveBeenCalledWith({
      name: "Personal",
      slug: "personal-u-1",
      plan: "personal",
      settings: {},
      ownerId: "u-1",
    });
  });

  it("publishes OrganizationCreated event on success", async () => {
    const bus = new InMemoryEventBus();
    const orgEvent = { organizationId: "org-1", name: "Personal", slug: "personal-u-1", ownerId: "u-1" };
    const createOrganization = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => false,
        unwrap: () => ({ organizationId: "org-1", event: orgEvent }),
      }),
    };
    const bridge = createBridge({ createOrganization });

    const published: { event: string; payload: unknown }[] = [];
    const originalPublish = bus.publish.bind(bus);
    vi.spyOn(bus, "publish").mockImplementation(async (event, payload) => {
      published.push({ event, payload });
      return originalPublish(event, payload);
    });

    bridge.wire(bus);

    await originalPublish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    const orgCreatedPublish = published.find((p) => p.event === "OrganizationCreated");
    expect(orgCreatedPublish).toBeDefined();
    expect(orgCreatedPublish!.payload).toEqual(orgEvent);
  });

  it("does not publish event on failure result", async () => {
    const bus = new InMemoryEventBus();
    const createOrganization = {
      execute: vi.fn().mockResolvedValue({
        isFail: () => true,
        error: new Error("slug taken"),
      }),
    };
    const bridge = createBridge({ createOrganization });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const published: string[] = [];
    const originalPublish = bus.publish.bind(bus);
    vi.spyOn(bus, "publish").mockImplementation(async (event, payload) => {
      published.push(event);
      return originalPublish(event, payload);
    });

    bridge.wire(bus);

    await originalPublish("UserRegistered", {
      userId: "u-1",
      email: "user@example.com",
      occurredAt: new Date("2026-01-01"),
    });

    expect(published).not.toContain("OrganizationCreated");
    expect(consoleSpy).toHaveBeenCalledWith(
      "[auth-organizations] CreateOrganization failed:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("handles thrown exception gracefully without re-throwing", async () => {
    const bus = new InMemoryEventBus();
    const createOrganization = {
      execute: vi.fn().mockRejectedValue(new Error("crash")),
    };
    const bridge = createBridge({ createOrganization });
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
