import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface UserRegisteredEvent {
  userId: string;
  email: string;
  occurredAt: Date;
}

interface CreateOrganizationResult {
  isFail(): boolean;
  error?: Error;
}

export interface ICreateOrganization {
  execute(input: {
    name: string;
    slug: string;
    ownerId: string;
    plan?: string;
    settings?: Record<string, unknown>;
  }): Promise<CreateOrganizationResult>;
}

export interface AuthOrganizationsBridgeDeps {
  createOrganization: ICreateOrganization;
}

export function createBridge(deps: AuthOrganizationsBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<UserRegisteredEvent>("UserRegistered", async (event) => {
        try {
          const result = await deps.createOrganization.execute({
            name: "Personal",
            slug: `personal-${event.userId}`,
            plan: "personal",
            settings: {},
            ownerId: event.userId,
          });
          if (result.isFail()) {
            console.error("[auth-organizations] CreateOrganization failed:", result.error);
          }
        } catch (error) {
          console.error("[auth-organizations] Failed to create personal organization:", error);
        }
      });
    },
  };
}
