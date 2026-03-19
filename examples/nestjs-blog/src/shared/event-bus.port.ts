export interface IEventBus {
  subscribe<T>(eventName: string, handler: (event: T) => Promise<void>): void;
  publish<T>(eventName: string, event: T): Promise<void>;
}
