import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";
import type { ICreateCustomer } from "../../capabilities/billing/contracts/create-customer.types.js";

interface UserRegisteredEvent {
  userId: string;
  email: string;
  occurredAt: Date;
}

export interface AuthBillingBridgeDeps {
  createCustomer: ICreateCustomer;
}

export function createBridge(deps: AuthBillingBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<UserRegisteredEvent>("UserRegistered", async (event) => {
        try {
          const localPart = event.email.split("@")[0];
          const result = await deps.createCustomer.execute({
            id: event.userId,
            email: event.email,
            name: localPart || event.email,
          });
          if (result.isFail()) {
            console.error("[auth-billing] CreateCustomer failed:", result.unwrapError());
          }
        } catch (error) {
          console.error("[auth-billing] Failed to create billing customer:", error);
        }
      });
    },
  };
}
