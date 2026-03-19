// Template: import type { IEventBus } from "{{shared_rel}}/event-bus.port.js";
import type { IEventBus } from "../../../shared/src/event-bus.port.js";
// Template: import type { Bridge } from "{{shared_rel}}/bridge.js";
import type { Bridge } from "../../../shared/src/bridge.js";
// Template: import type { ICreateCustomer } from "{{cap_rel}}/billing/contracts/create-customer.types.js";
import type { ICreateCustomer } from "../../capabilities/billing/contracts/create-customer.types.js";

interface OrganizationCreatedEvent {
  organizationId: string;
  name: string;
  slug: string;
  ownerId: string;
  occurredAt: Date;
}

export interface OrganizationsBillingBridgeDeps {
  createCustomer: ICreateCustomer;
}

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/g, "");
}

export function createBridge(deps: OrganizationsBillingBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<OrganizationCreatedEvent>("OrganizationCreated", async (event) => {
        try {
          const result = await deps.createCustomer.execute({
            id: event.organizationId,
            email: `billing+${sanitizeSlug(event.slug)}@org.internal`,
            name: event.name,
          });
          if (result.isFail()) {
            console.error("[organizations-billing] CreateCustomer failed:", result.unwrapError());
          }
        } catch (error) {
          console.error("[organizations-billing] Failed to create org billing customer:", error);
        }
      });
    },
  };
}
