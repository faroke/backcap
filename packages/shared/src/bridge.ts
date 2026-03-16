import type { IEventBus } from "./event-bus.port.js";

export interface Bridge {
  wire(eventBus: IEventBus): void;
}
