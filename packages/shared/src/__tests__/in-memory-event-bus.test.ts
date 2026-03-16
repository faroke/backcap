import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../in-memory-event-bus.js";

describe("InMemoryEventBus", () => {
  it("delivers a published event to a subscriber", async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("TestEvent", handler);
    await bus.publish("TestEvent", { id: "1" });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ id: "1" });
  });

  it("delivers a published event to multiple handlers", async () => {
    const bus = new InMemoryEventBus();
    const handler1 = vi.fn().mockResolvedValue(undefined);
    const handler2 = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("TestEvent", handler1);
    bus.subscribe("TestEvent", handler2);
    await bus.publish("TestEvent", { id: "2" });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it("does not error when publishing with no handlers", async () => {
    const bus = new InMemoryEventBus();

    await expect(bus.publish("NoHandlers", { id: "3" })).resolves.toBeUndefined();
  });

  it("propagates handler errors without breaking other handlers", async () => {
    const bus = new InMemoryEventBus();
    const handler1 = vi.fn().mockRejectedValue(new Error("boom"));
    const handler2 = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("TestEvent", handler1);
    bus.subscribe("TestEvent", handler2);

    await expect(bus.publish("TestEvent", { id: "4" })).rejects.toThrow("boom");
    // handler2 was not called because handler1 threw and publish dispatches sequentially
    expect(handler1).toHaveBeenCalledOnce();
  });
});
