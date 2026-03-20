import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

interface UserRegisteredEvent {
  userId: string;
  email: string;
  occurredAt: Date;
}

interface AssignRoleResult {
  isFail(): boolean;
  error?: Error;
}

export interface IAssignRole {
  execute(input: {
    userId: string;
    roleId: string;
    organizationId?: string;
  }): Promise<AssignRoleResult>;
}

export interface AuthRbacBridgeDeps {
  assignRole: IAssignRole;
  defaultRoleId: string;
}

export function createBridge(deps: AuthRbacBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<UserRegisteredEvent>("UserRegistered", async (event) => {
        try {
          const result = await deps.assignRole.execute({
            userId: event.userId,
            roleId: deps.defaultRoleId,
          });
          if (result.isFail()) {
            console.error("[auth-rbac] AssignRole failed:", result.error);
          }
        } catch (error) {
          console.error("[auth-rbac] Failed to assign default role:", error);
        }
      });
    },
  };
}
