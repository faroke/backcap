/**
 * Simple in-memory event bus for wiring bridges.
 * This is the same pattern used by @backcap/shared.
 */
export interface IEventBus {
  subscribe<T>(eventName: string, handler: (event: T) => Promise<void>): void;
  publish<T>(eventName: string, event: T): Promise<void>;
}

type EventHandler = (event: unknown) => Promise<void>;

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe<T>(eventName: string, handler: (event: T) => Promise<void>): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventName, existing);
  }

  async publish<T>(eventName: string, event: T): Promise<void> {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
